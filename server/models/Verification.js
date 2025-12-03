// models/Verification.js
import mongoose from "mongoose";

const { Schema, model, models, Types } = mongoose;

const verificationSchema = new Schema(
  {
    vote_id: {
      type: Schema.Types.ObjectId,
      unique: true,
      default: () => new Types.ObjectId(),
    },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vote_type: {
      type: String,
      enum: ["upvote", "downvote", "flag"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

verificationSchema.index({ vote_id: 1 });

export default models.Verification || model("Verification", verificationSchema);