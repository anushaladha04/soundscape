import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8, specialCharacter: true},
    googleId: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);


