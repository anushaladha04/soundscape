// server/routes/bookmarks.js
import express from "express";
import Bookmark from "../models/Bookmark.js";
import Event from "../models/Event.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/bookmarks
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today

    // Find all bookmarks for this user and populate the associated Event docs.
    const bookmarks = await Bookmark.find({ user_id: userId })
      .populate("event_id")
      .sort({ "event_id.date": 1 });

    // Filter to only upcoming events (date >= today) and remove past ones from DB
    const upcomingEvents = [];
    const toDelete = [];

    for (const b of bookmarks) {
      const ev = b.event_id;
      if (!ev) {
        // Event was deleted, remove the bookmark
        toDelete.push(b._id);
        continue;
      }

      // Check if event date is in the past
      const eventDate = new Date(ev.date);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate < now) {
        // Past event - mark bookmark for deletion
        toDelete.push(b._id);
      } else {
        // Upcoming event - keep it
        upcomingEvents.push(ev);
      }
    }

    // Clean up past bookmarks from database
    if (toDelete.length > 0) {
      await Bookmark.deleteMany({ _id: { $in: toDelete } });
    }

    res.json({
      bookmarks: upcomingEvents,
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
    const userId = req.userId;
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
    const userId = req.userId;
    const { eventId } = req.params;

    await Bookmark.findOneAndDelete({ user_id: userId, event_id: eventId });

    res.json({ message: "Bookmark removed" });
  } catch (err) {
    console.error("Error in DELETE /api/bookmarks/:eventId:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
