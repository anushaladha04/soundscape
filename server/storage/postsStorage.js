// Temporary in-memory storage for posts
// This will be replaced with MongoDB when schema is ready
// Structure matches Mongoose document format exactly

import { verificationsStorage } from './verificationsStorage.js';

let posts = [];
let nextId = 1;

// Helper to generate MongoDB-like ObjectId string
function generateId() {
  return `temp_${nextId++}_${Date.now()}`;
}

// Calculate likes and dislikes for a post from verification records
function calculateVotes(postId) {
  const votes = verificationsStorage.findByPost(postId);
  const likes = votes.filter(v => v.vote_type === 'like').length;
  const dislikes = votes.filter(v => v.vote_type === 'dislike').length;
  return { likes, dislikes };
}

// Calculate ratio: likes / (likes + dislikes + 1) to prevent division by zero
function calculateRatio(likes, dislikes) {
  const total = likes + dislikes;
  if (total === 0) return 0;
  return likes / (total + 1);
}

export const postsStorage = {
  // Create a new post
  create: (postData) => {
    const now = new Date();
    const post = {
      _id: generateId(),
      ...postData,
      createdAt: now,
      updatedAt: now,
    };
    posts.push(post);
    return post;
  },

  // Get all posts with votes calculated and sorted by ratio
  findAll: () => {
    // Calculate votes for each post and add to post object
    const postsWithVotes = posts.map(post => {
      const { likes, dislikes } = calculateVotes(post._id);
      const ratio = calculateRatio(likes, dislikes);
      return {
        ...post,
        likes,
        dislikes,
        ratio,
      };
    });

    // Sort by ratio descending (highest first)
    return postsWithVotes.sort((a, b) => b.ratio - a.ratio);
  },

  // Get post by ID with votes
  findById: (id) => {
    const post = posts.find(post => post._id === id);
    if (!post) return null;

    const { likes, dislikes } = calculateVotes(id);
    const ratio = calculateRatio(likes, dislikes);
    return {
      ...post,
      likes,
      dislikes,
      ratio,
    };
  },

  // Vote on a post
  vote: (postId, userId, voteType) => {
    // Check if post exists
    const post = posts.find(p => p._id === postId);
    if (!post) {
      return null; // Return null instead of throwing
    }

    // Check if user already voted
    const existingVote = verificationsStorage.findByUserAndPost(userId, postId);

    if (existingVote) {
      // User already voted - update their vote
      if (existingVote.vote_type === voteType) {
        // Same vote type - no change needed, just return the post
        return this.findById(postId);
      }
      // Change vote type
      verificationsStorage.update(existingVote.vote_id, voteType);
    } else {
      // New vote - create verification record
      verificationsStorage.create(userId, postId, voteType);
    }

    // Return updated post with new vote counts
    return this.findById(postId);
  },

  // Get user's vote for a post
  getUserVote: (postId, userId) => {
    const vote = verificationsStorage.findByUserAndPost(userId, postId);
    return vote ? vote.vote_type : null;
  },

  // Clear all posts (useful for testing)
  clear: () => {
    posts = [];
    nextId = 1;
  },
};
