import express from "express";
import UserUpload from "../models/UserUpload.js";
import Verification from "../models/Verification.js";

const router = express.Router();

// Helper function to calculate votes for a post
const calculateVotes = async (postId) => {
  const votes = await Verification.find({ post_id: postId });
  const likes = votes.filter(v => v.vote_type === 'like').length;
  const dislikes = votes.filter(v => v.vote_type === 'dislike').length;
  return { likes, dislikes };
};

// Helper function to calculate ratio
const calculateRatio = (likes, dislikes) => {
  const total = likes + dislikes;
  if (total === 0) return 0;
  return likes / (total + 1);
};

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
router.post("/", validatePost, async (req, res) => {
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

    const post = await UserUpload.create(postData);

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
router.get("/", async (req, res) => {
  try {
    const posts = await UserUpload.find().sort({ createdAt: -1 });
    
    // Calculate votes for each post
    const postsWithVotes = await Promise.all(
      posts.map(async (post) => {
        const { likes, dislikes } = await calculateVotes(post._id);
        const ratio = calculateRatio(likes, dislikes);
        return {
          ...post.toObject(),
          _id: post._id.toString(),
          likes,
          dislikes,
          ratio,
        };
      })
    );

    // Sort by ratio descending (highest first)
    postsWithVotes.sort((a, b) => b.ratio - a.ratio);

    res.json({ posts: postsWithVotes });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ 
      message: 'Failed to fetch posts',
      error: error.message 
    });
  }
});

// POST /api/posts/:id/vote - Vote on a post
router.post("/:id/vote", async (req, res) => {
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

    // Check if post exists
    const post = await UserUpload.findById(id);
    if (!post) {
      return res.status(404).json({ 
        message: 'Post not found' 
      });
    }

    // Check if user already voted
    const existingVote = await Verification.findOne({ 
      user_id: userId, 
      post_id: id 
    });

    if (existingVote) {
      // User already voted - update their vote if different
      if (existingVote.vote_type === voteType) {
        // Same vote type - no change needed
      } else {
        // Change vote type
        existingVote.vote_type = voteType;
        existingVote.timestamp = new Date();
        await existingVote.save();
      }
    } else {
      // New vote - create verification record
      await Verification.create({
        user_id: userId,
        post_id: id,
        vote_type: voteType,
      });
    }

    // Get updated post with votes
    const { likes, dislikes } = await calculateVotes(id);
    const ratio = calculateRatio(likes, dislikes);
    const updatedPost = {
      ...post.toObject(),
      _id: post._id.toString(),
      likes,
      dislikes,
      ratio,
    };

    // Get user's current vote
    const currentVote = await Verification.findOne({ 
      user_id: userId, 
      post_id: id 
    });
    const userVote = currentVote ? currentVote.vote_type : null;

    res.json({
      message: 'Vote recorded successfully',
      post: updatedPost,
      userVote,
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
router.get("/:id/vote", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    const vote = await Verification.findOne({ 
      user_id: userId, 
      post_id: id 
    });

    res.json({
      userVote: vote ? vote.vote_type : null,
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
