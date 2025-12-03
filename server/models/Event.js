// server/models/Event.js
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    // Mongo will give you _id automatically (this is your event_id)
    artist: { type: String, required: true },
    venue: { type: String },
    date: { type: Date },                // date/time
    genre: { type: String },             // Rock, Pop, etc.
    ticketmasterId: { type: String },    // ticketmaster_id

    // optional extra fields that will help *you* later for filters
    city: { type: String },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
