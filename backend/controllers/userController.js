import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { calculateMatchScore } from "../utils/matchmaking.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// REGISTER / SIGNUP USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN USER
export const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// SAVE MATCHMAKING DATA
export const saveMatchmaking = async (req, res) => {
  try {
    const { college, gender, preferences } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Simple score logic (can improve later)
    let score = 0;
    if (preferences?.length) score += preferences.length * 10;
    if (gender) score += 20;
    if (college) score += 30;

    user.matchmaking = {
      completed: true,
      college,
      gender,
      preferences,
      score,
    };

    await user.save();

    res.json({ message: "Matchmaking saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= MATCHMAKING LOGIC =================
export const findMatch = async (req, res) => {
  try {
    const { matchMode } = req.query; // "same-college" | "any"

    const currentUser = await User.findById(req.user._id);

    if (!currentUser?.matchmaking?.completed) {
      return res.status(400).json({ message: "Complete matchmaking first" });
    }

    const users = await User.find({
      _id: { $ne: currentUser._id },
      "matchmaking.completed": true,
    });

    if (!users.length) {
      return res.json({ message: "No users available right now" });
    }

    const scoredUsers = users.map((u) => ({
      user: u,
      score: calculateMatchScore(currentUser, u, matchMode),
    }));

    scoredUsers.sort((a, b) => b.score - a.score);

    const bestMatch = scoredUsers[0];

    res.json({
      matchedUserId: bestMatch.user._id,
      score: bestMatch.score,
      college: bestMatch.user.matchmaking.college,
      gender: bestMatch.user.matchmaking.gender,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
