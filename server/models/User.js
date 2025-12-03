
// models/User.js
import mongoose from "mongoose";

const { Schema, model, models, Types } = mongoose;

const userSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      unique: true,
      default: () => new Types.ObjectId(),
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password_hash: { type: String },
    googleID: { type: String, index: true },
    genre_pref: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.index({ user_id: 1 });

export default models.User || model("User", userSchema);