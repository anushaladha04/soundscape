// models/UserUpload.js
import mongoose from "mongoose";

const { Schema, model, models, Types } = mongoose;

const userUploadSchema = new Schema(
  {
    upload_id: {
      type: Schema.Types.ObjectId,
      unique: true,
      default: () => new Types.ObjectId(),
    },
    event_title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    genre: { type: String, required: true },
    venue: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
  },
  { timestamps: true }
);

userUploadSchema.index({ upload_id: 1 });

export default models.UserUpload || model("UserUpload", userUploadSchema);
