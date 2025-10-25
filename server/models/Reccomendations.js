// models/Recommendation.js
import mongoose from "mongoose";

const { Schema, model, models, Types } = mongoose;

const recommendationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    genre: { type: String, required: true },
  },
  { timestamps: true }
);

recommendationSchema.index({ user_id: 1 }, { unique: true });

export default models.Recommendation || model("Recommendation", recommendationSchema);
