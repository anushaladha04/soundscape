import express from "express";
import { postsStorage } from "../storage/postsStorage.js";

const router = express.Router();

// Validation helper
const validatePost = (req, res, next) => {
  const { eventTitle, artistName, genre, date, time, venue, address, city, state } = req.body;

  const errors = [];

  // Check required fields
  if (!eventTitle || typeof eventTitle !== 'string' || eventTitle.trim() === '') {
    errors.push('Event title is required');
  }
  if (!artistName || typeof artistName !== 'string' || artistName.trim() === '') {
    errors.push('Artist name is required');
  }
  if (!genre || typeof genre !== 'string' || genre.trim() === '') {
    errors.push('Genre is required');
  }
  if (!date || typeof date !== 'string' || date.trim() === '') {
    errors.push('Date is required');
  }
  if (!time || typeof time !== 'string' || time.trim() === '') {
    errors.push('Time is required');
  }
  if (!venue || typeof venue !== 'string' || venue.trim() === '') {
    errors.push('Venue is required');
  }
  if (!address || typeof address !== 'string' || address.trim() === '') {
    errors.push('Address is required');
  }
  if (!city || typeof city !== 'string' || city.trim() === '') {
    errors.push('City is required');
  }
  if (!state || typeof state !== 'string' || state.trim() === '') {
    errors.push('State is required');
  }

  // Basic date format validation (YYYY-MM-DD)
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
    errors.push('Date must be in YYYY-MM-DD format');
  }

  // Basic time format validation (HH:MM)
  if (time && !/^\d{2}:\d{2}$/.test(time.trim())) {
    errors.push('Time must be in HH:MM format');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};

// POST /api/posts - Submit a new post
router.post("/", validatePost, (req, res) => {
  try {
    const { eventTitle, artistName, genre, date, time, venue, address, city, state, zipCode } = req.body;

    const postData = {
      eventTitle: eventTitle.trim(),
      artistName: artistName.trim(),
      genre: genre.trim(),
      date: date.trim(),
      time: time.trim(),
      venue: venue.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode ? zipCode.trim() : '',
    };

    const post = postsStorage.create(postData);

    res.status(201).json({
      message: 'Post submitted successfully',
      post,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      message: 'Failed to create post',
      error: error.message 
    });
  }
});

// GET /api/posts - Get all posts
router.get("/", (req, res) => {
  try {
    const posts = postsStorage.findAll();
    res.json({ posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      message: 'Failed to fetch posts',
      error: error.message 
    });
  }
});

// POST /api/posts/:id/vote - Vote on a post
router.post("/:id/vote", (req, res) => {
  try {
    const { id } = req.params;
    const { userId, voteType } = req.body;

    // Validation
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    if (!voteType || !['like', 'dislike'].includes(voteType)) {
      return res.status(400).json({ 
        message: 'Vote type must be "like" or "dislike"' 
      });
    }

    const updatedPost = postsStorage.vote(id, userId, voteType);

    if (!updatedPost) {
      return res.status(404).json({ 
        message: 'Post not found' 
      });
    }

    // Get user's current vote
    const userVote = postsStorage.getUserVote(id, userId);

    res.json({
      message: 'Vote recorded successfully',
      post: updatedPost,
      userVote, // Return user's vote so frontend knows what they voted
    });
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(500).json({ 
      message: 'Failed to record vote',
      error: error.message 
    });
  }
});

// GET /api/posts/:id/vote - Get user's vote for a post
router.get("/:id/vote", (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    const userVote = postsStorage.getUserVote(id, userId);

    res.json({
      userVote: userVote || null,
    });
  } catch (error) {
    console.error('Error fetching user vote:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user vote',
      error: error.message 
    });
  }
});

export default router;

