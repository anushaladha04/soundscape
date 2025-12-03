// models/Event.js
import mongoose from "mongoose";

const { Schema, model, models, Types } = mongoose;

const eventSchema = new Schema(
  {
    event_id: {
      type: Schema.Types.ObjectId,
      unique: true,
      default: () => new Types.ObjectId(),
    },
    artist: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    genre: { type: String, required: true },
    ticketmaster_id: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

eventSchema.index({ event_id: 1 });

export default models.Event || model("Event", eventSchema);
