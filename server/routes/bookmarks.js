// server/routes/bookmarks.js
import express from "express";
import Bookmark from "../models/Bookmark.js";
import Event from "../models/Event.js";

const router = express.Router();

const requireAuth = (req, res, next) => {
  const userId = req.user?.user_id || req.user?._id;
  if (!userId) {
    return res.status(401).json({ message: "Not logged in" });
  }
  req.currentUserId = userId;
  next();
};

/**
 * GET /api/bookmarks
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.currentUserId;
    const now = new Date();

    // NOTE: user_id and event_id to match schema
    const bookmarks = await Bookmark.find({ user_id: userId })
      .populate("event_id")
      .sort({ "event_id.date": 1 });

    const upcomingEvents = [];
    const toDelete = [];

    for (const b of bookmarks) {
      const ev = b.event_id;
      if (!ev || !ev.date || ev.date < now) {
        toDelete.push(b._id);
      } else {
        upcomingEvents.push(ev); // just send the event docs to the client
      }
    }

    if (toDelete.length > 0) {
      await Bookmark.deleteMany({ _id: { $in: toDelete } });
    }

    res.json({
      bookmarks: upcomingEvents, // array of Event docs
      count: upcomingEvents.length,
    });
  } catch (err) {
    console.error("Error in GET /api/bookmarks:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/bookmarks
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.currentUserId;
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({ message: "eventId is required" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const bookmark = await Bookmark.findOneAndUpdate(
      { user_id: userId, event_id: eventId },
      { user_id: userId, event_id: eventId }, // ensure required fields set
      { new: true, upsert: true }
    ).populate("event_id");

    res.json({ bookmark });
  } catch (err) {
    console.error("Error in POST /api/bookmarks:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /api/bookmarks/:eventId
 */
router.delete("/:eventId", requireAuth, async (req, res) => {
  try {
    const userId = req.currentUserId;
    const { eventId } = req.params;

    await Bookmark.findOneAndDelete({ user_id: userId, event_id: eventId });

    res.json({ message: "Bookmark removed" });
  } catch (err) {
    console.error("Error in DELETE /api/bookmarks/:eventId:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
