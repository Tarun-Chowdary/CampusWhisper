import express from "express";
import {
  registerUser,
  authUser,
  saveMatchmaking,
  findMatch,
} from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================== TEST ROUTE ================== */
router.get("/ping", (req, res) => {
  res.json({ message: "API working" });
});

/* ================== AUTH ================== */
router.post("/signup", registerUser);
router.post("/login", authUser);

/* ================== MATCHMAKING ================== */
router.post("/matchmaking", protect, saveMatchmaking);
router.get("/findMatch", protect, findMatch);

export default router;
