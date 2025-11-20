// models/User.js
import mongoose from "mongoose";

const { Schema, model, models, Types } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    googleId: { type: String },
    genres: { type: [String], default: [] },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// No custom index on user_id; we rely on MongoDB's default _id index
export default models.User || model("User", userSchema);