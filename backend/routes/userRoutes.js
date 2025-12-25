import express from "express";
import {
  registerUser,
  authUser,
  saveMatchmaking,
  findMatch,
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// auth
router.post("/signup", registerUser);
router.post("/login", authUser);

// matchmaking data save
router.post("/matchmaking", protect, saveMatchmaking);

// 🔥 THIS IS THE IMPORTANT ONE
router.get("/findMatch", protect, findMatch);

export default router;
