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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

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
});

/* ================== SOCKET STATE ================== */
const matchmakingQueue = [];
const activeChats = {}; // roomId -> { remaining, timer, votes }

/* ================== TIMER LOGIC ================== */
const startChatTimer = (roomId) => {
  const chat = activeChats[roomId];
  if (!chat) return;

  chat.timer = setInterval(() => {
    chat.remaining -= 1;

    io.to(roomId).emit("timer-update", chat.remaining);

    if (chat.remaining === 10) {
      chat.votes = {};
      io.to(roomId).emit("ask-extension");
    }

    if (chat.remaining <= 0) {
      clearInterval(chat.timer);
      io.to(roomId).emit("chat-ended");
      delete activeChats[roomId];
    }
  }, 1000);
};

/* ================== SOCKET EVENTS ================== */
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join-queue", ({ userId }) => {
    if (matchmakingQueue.find((u) => u.userId === userId)) return;

    matchmakingQueue.push({ socketId: socket.id, userId });

    if (matchmakingQueue.length >= 2) {
      const a = matchmakingQueue.shift();
      const b = matchmakingQueue.shift();

      const roomId = [a.userId, b.userId].sort().join("_");

      activeChats[roomId] = {
        remaining: 300,
        votes: {},
        timer: null,
      };

      io.to(a.socketId).emit("match-found", {
        roomId,
        matchedUserId: b.userId,
      });

      io.to(b.socketId).emit("match-found", {
        roomId,
        matchedUserId: a.userId,
      });

      startChatTimer(roomId);
    }
  });

  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
  });

  socket.on("send-message", ({ roomId, text }) => {
    socket.to(roomId).emit("receive-message", {
      text,
      senderSocketId: socket.id,
    });
  });

  socket.on("extension-vote", ({ roomId, vote, extraTime }) => {
    const chat = activeChats[roomId];
    if (!chat) return;

    chat.votes[socket.id] = vote;
    const votes = Object.values(chat.votes);

    if (votes.includes("no")) {
      clearInterval(chat.timer);
      io.to(roomId).emit("chat-ended");
      delete activeChats[roomId];
      return;
    }

    if (votes.length === 2 && votes.every((v) => v === "yes")) {
      chat.remaining += extraTime;
      io.to(roomId).emit("timer-extended", chat.remaining);
      chat.votes = {};
    }
  });

  socket.on("end-chat", ({ roomId }) => {
    if (activeChats[roomId]) {
      clearInterval(activeChats[roomId].timer);
      delete activeChats[roomId];
    }
    io.to(roomId).emit("chat-ended");
  });

  socket.on("disconnect", () => {
    const index = matchmakingQueue.findIndex((u) => u.socketId === socket.id);
    if (index !== -1) matchmakingQueue.splice(index, 1);
    console.log("🔴 User disconnected:", socket.id);
  });

  socket.on("typing", ({ roomId }) => {
    socket.to(roomId).emit("typing");
  });

  socket.on("extend-decision", (data) => {
    socket.to(data.roomId).emit("other-voted");
    io.to(data.roomId).emit("extend-decision", data);
  });
});

/* ================== LISTEN ================== */
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
