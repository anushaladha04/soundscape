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
    eventTitle: { type: String, required: true, trim: true },
    artistName: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, default: "" },
  },
  { timestamps: true }
);

// upload_id already has unique: true which creates an index, so no need for separate index

export default models.UserUpload || model("UserUpload", userUploadSchema);
