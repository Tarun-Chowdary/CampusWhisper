import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    // 👇 ALL matchmaking-related data lives here ONLY
    matchmaking: {
      completed: {
        type: Boolean,
        default: false,
      },

      gender: {
        type: String,
      },

      college: {
        type: String,
      },

      preferences: {
        type: [String],
        default: [],
      },

      interests: {
        type: [String],
        default: [],
      },

      score: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
