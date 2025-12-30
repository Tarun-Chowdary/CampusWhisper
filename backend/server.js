import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const app = express();

/* ================== MIDDLEWARE ================== */
const allowedOrigin = "https://campus-whisper.vercel.app";

app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

/* ================== ROUTES ================== */
app.use("/api/users", userRoutes);

/* ================== SERVER ================== */
const httpServer = createServer(app);

/* ================== SOCKET.IO ================== */
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000, // 🔥 IMPORTANT
});

/* ================== SOCKET STATE ================== */
const matchmakingQueue = [];
const activeChats = {}; // roomId -> { remaining, timer }
const extendVotes = {}; // roomId -> { votes: Set, extraTime }

/* ================== TIMER ================== */
const startChatTimer = (roomId) => {
  const chat = activeChats[roomId];
  if (!chat) return;

  chat.timer = setInterval(() => {
    chat.remaining -= 1;
    io.to(roomId).emit("timer-update", chat.remaining);

    // ⛔ NEVER auto-end chat
    if (chat.remaining < 0) {
      chat.remaining = 0;
    }
  }, 1000);
};

/* ================== CLEANUP ================== */
const cleanupRoom = (roomId) => {
  const chat = activeChats[roomId];
  if (chat?.timer) clearInterval(chat.timer);
  delete activeChats[roomId];
  delete extendVotes[roomId];
  io.in(roomId).socketsLeave(roomId);
};

/* ================== SOCKET EVENTS ================== */
io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  /* ---------- MATCHMAKING ---------- */
  socket.on("join-queue", ({ userId }) => {
    if (matchmakingQueue.find((u) => u.userId === userId)) return;

    matchmakingQueue.push({ socketId: socket.id, userId });

    if (matchmakingQueue.length >= 2) {
      const a = matchmakingQueue.shift();
      const b = matchmakingQueue.shift();

      const roomId = `${a.socketId}_${b.socketId}`;

      activeChats[roomId] = {
        remaining: 300,
        timer: null,
      };

      socket.join(roomId);
      io.to(a.socketId).socketsJoin(roomId);
      io.to(b.socketId).socketsJoin(roomId);

      io.to(roomId).emit("match-found", { roomId });

      startChatTimer(roomId);
    }
  });

  /* ---------- ROOM ---------- */
  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
  });

  /* ---------- MESSAGES ---------- */
  socket.on("send-message", ({ roomId, text }) => {
    socket.to(roomId).emit("receive-message", {
      text,
      senderSocketId: socket.id,
    });
  });

  /* ---------- TYPING ---------- */
  socket.on("typing", ({ roomId }) => {
    socket.to(roomId).emit("typing");
  });

  /* ---------- EXTEND ---------- */
  socket.on("extend-decision", ({ roomId, decision, extraTime }) => {
    if (!activeChats[roomId]) return;

    if (decision === "reject") {
      io.to(roomId).emit("extend-result", { decision: "reject" });
      cleanupRoom(roomId);
      return;
    }

    if (!extendVotes[roomId]) {
      extendVotes[roomId] = {
        votes: new Set(),
        extraTime,
      };
    }

    extendVotes[roomId].votes.add(socket.id);
    socket.to(roomId).emit("other-voted");

    if (extendVotes[roomId].votes.size === 2) {
      activeChats[roomId].remaining += extendVotes[roomId].extraTime;

      io.to(roomId).emit("extend-result", {
        decision: "accept",
        extraTime: extendVotes[roomId].extraTime,
      });

      delete extendVotes[roomId];
    }
  });

  /* ---------- END / REPORT ---------- */
  socket.on("end-chat", ({ roomId }) => {
    io.to(roomId).emit("chat-ended");
    cleanupRoom(roomId);
  });

  /* ---------- DISCONNECT ---------- */
  socket.on("disconnect", () => {
    const i = matchmakingQueue.findIndex((u) => u.socketId === socket.id);
    if (i !== -1) matchmakingQueue.splice(i, 1);
    console.log("🔴 Disconnected:", socket.id);
  });
});

/* ================== LISTEN ================== */
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
