// models/Bookmark.js
import mongoose from "mongoose";

const { Schema, model, models, Types } = mongoose;

const bookmarkSchema = new Schema(
  {
    bookmark_id: {
      type: Schema.Types.ObjectId,
      unique: true,
      default: () => new Types.ObjectId(),
    },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event_id: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

bookmarkSchema.index({ bookmark_id: 1 });
bookmarkSchema.index({ user_id: 1, event_id: 1 }, { unique: true });

export default models.Bookmark || model("Bookmark", bookmarkSchema);
