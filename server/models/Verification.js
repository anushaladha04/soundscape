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
    user_id: { type: String, required: true }, // Can be ObjectId string or localStorage userId
    post_id: { type: Schema.Types.ObjectId, ref: "UserUpload", required: true },
    vote_type: {
      type: String,
      enum: ["like", "dislike"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// vote_id already has unique: true which creates an index, so no need for separate index
verificationSchema.index({ user_id: 1, post_id: 1 }, { unique: true });

export default models.Verification || model("Verification", verificationSchema);