// Temporary in-memory storage for votes/verifications
// This will be replaced with MongoDB when schema is ready
// Structure matches MongoDB Verification schema: { vote_id, user_id, vote_type, post_id, timestamp }

let verifications = [];
let nextId = 1;

// Helper to generate MongoDB-like ObjectId string
function generateId() {
  return `vote_${nextId++}_${Date.now()}`;
}

export const verificationsStorage = {
  // Create a new vote/verification
  create: (userId, postId, voteType) => {
    const now = new Date();
    const verification = {
      vote_id: generateId(),
      user_id: userId,
      vote_type: voteType, // 'like' or 'dislike'
      post_id: postId,
      timestamp: now,
    };
    verifications.push(verification);
    return verification;
  },

  // Find vote by user and post (to check if user already voted)
  findByUserAndPost: (userId, postId) => {
    return verifications.find(
      v => v.user_id === userId && v.post_id === postId
    );
  },

  // Update existing vote (change vote_type)
  update: (voteId, voteType) => {
    const verification = verifications.find(v => v.vote_id === voteId);
    if (verification) {
      verification.vote_type = voteType;
      verification.timestamp = new Date();
      return verification;
    }
    return null;
  },

  // Get all votes for a specific post
  findByPost: (postId) => {
    return verifications.filter(v => v.post_id === postId);
  },

  // Get vote by ID
  findById: (voteId) => {
    return verifications.find(v => v.vote_id === voteId);
  },

  // Clear all verifications (useful for testing)
  clear: () => {
    verifications = [];
    nextId = 1;
  },
};

