// User identification utility
// Generates and stores a unique user ID in localStorage
// This works without authentication - each browser gets a unique ID

const USER_ID_KEY = 'soundscape_user_id';

export function getUserId() {
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // Generate a unique ID
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}

export function resetUserId() {
  localStorage.removeItem(USER_ID_KEY);
  return getUserId(); // Generate new ID
}

