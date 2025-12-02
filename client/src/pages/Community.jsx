import { useEffect, useState } from 'react';
import { getUserId } from '../utils/userId';

// svg icon components: AI generated
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    <path d="M8 1C5.24 1 3 3.24 3 6C3 9.5 8 15 8 15S13 9.5 13 6C13 3.24 10.76 1 8 1Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const TheaterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    <path d="M2 4H14V13H2V4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M2 4L8 1L14 4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M5 8H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 10H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function Community({ onOpenModal }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userVotes, setUserVotes] = useState({}); // { postId: 'like' | 'dislike' }
  const [votingPostId, setVotingPostId] = useState(null); // Track which post is being voted on

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/posts');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch posts');
      }

      const postsData = data.posts || [];
      setPosts(postsData);
      setError('');

      // Fetch user votes for all posts
      const userId = getUserId();
      const votePromises = postsData.map(post =>
        fetch(`/api/posts/${post._id}/vote?userId=${userId}`)
          .then(res => res.json())
          .then(data => ({ postId: post._id, vote: data.userVote }))
          .catch(() => ({ postId: post._id, vote: null }))
      );

      const votes = await Promise.all(votePromises);
      const votesMap = {};
      votes.forEach(({ postId, vote }) => {
        votesMap[postId] = vote;
      });
      setUserVotes(votesMap);
    } catch (err) {
      setError(err.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId, voteType) => {
    if (votingPostId === postId) return; // Prevent double-clicking

    setVotingPostId(postId);
    const userId = getUserId();

    if (!userId) {
      alert('Unable to identify user. Please refresh the page.');
      setVotingPostId(null);
      return;
    }

    try {
      // Send the vote type - backend will handle unvoting if same type is clicked again
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, voteType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to vote');
      }

      // Update user's vote state
      setUserVotes(prev => ({
        ...prev,
        [postId]: data.userVote || null,
      }));

      // Refresh posts to get updated counts and sorting
      await fetchPosts();
    } catch (err) {
      console.error('Error voting:', err);
      alert(err.message || 'Failed to vote. Please try again.');
    } finally {
      setVotingPostId(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      // Handle HH:MM format
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const capitalizeWords = (str) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">

        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold mb-2">Your Community</h1>
          <p className="text-gray-400 text-lg">Loading posts...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black text-white">

        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-semibold mb-2">Your Community</h1>
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchPosts}
            className="mt-4 px-4 py-2 bg-[#f26f5e] text-white rounded-md hover:bg-[#ff8270]"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Community Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold mb-2">Your Community</h1>
            <p className="text-sm text-gray-400">
              Remember these posts are from your fellow community members and are unverified.
            </p>
          </div>
          {onOpenModal && (
            <button
              onClick={onOpenModal}
              className="px-4 py-2 rounded bg-[#f26f5e] hover:bg-[#ff8270] text-sm font-medium text-white"
            >
              Submit a Post
            </button>
          )}
        </div>

        {/* Community Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No posts yet.</p>
            <p className="text-gray-500">Be the first to share a concert event!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const userVote = userVotes[post._id];
              const isVoting = votingPostId === post._id;
              const likes = post.likes || 0;
              const dislikes = post.dislikes || 0;

              return (
                <div
                  key={post._id}
                  className="border-4 border-[#2a2a2a] rounded-lg overflow-hidden hover:border-[#f26f5e] transition-colors group flex flex-col"
                >
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Genre Tag */}
                    {post.genre && (
                      <p className="text-xs text-[#f26f5e] font-semibold mb-2 uppercase tracking-wide">
                        {post.genre}
                      </p>
                    )}

                    {/* Title */}
                    {post.eventTitle && (
                      <h3 className="font-bold text-xl mb-2 line-clamp-2 text-white">
                        {post.eventTitle}
                      </h3>
                    )}

                    {/* Artist */}
                    {post.artistName && (
                      <p className="text-sm text-gray-400 mb-4">{post.artistName}</p>
                    )}

                    {/* Details */}
                    <div className="space-y-2 text-sm text-gray-400 mb-6 flex-grow">
                      {(post.date || post.time) && (
                        <p className="flex items-center gap-2">
                          <ClockIcon />
                          {post.date && <span>{formatDate(post.date)}</span>}
                          {post.date && post.time && <span className="text-gray-500">•</span>}
                          {post.time && <span>{formatTime(post.time)}</span>}
                        </p>
                      )}
                      {post.venue && (
                        <p className="flex items-center gap-2">
                          <TheaterIcon />
                          <span>{post.venue}</span>
                        </p>
                      )}
                      <p className="flex items-start gap-2">
                        <span className="flex-shrink-0 mt-0.5">
                          <PinIcon />
                        </span>
                        <span className="break-words min-w-0">
                          {post.address && post.city && post.state && post.zipCode ? (
                            <>
                              {post.address}, {capitalizeWords(post.city)}, {capitalizeWords(post.state)} {post.zipCode}
                            </>
          ) : (
                            <span>No Specific Address Provided</span>
                          )}
                        </span>
                      </p>
                    </div>

                    {/* Vote Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(post._id, 'like');
                        }}
                        disabled={isVoting}
                        className={`flex items-center gap-1 flex-1 px-3 py-2 rounded-md text-sm transition-colors ${
                                 userVote === 'like'
                            ? 'bg-[#f26f5e] text-white hover:bg-[#ff8270]'
                            : 'border border-[#2a2a2a] bg-transparent text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
                        } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-lg">↑</span>
                        {likes}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(post._id, 'dislike');
                        }}
                        disabled={isVoting}
                        className={`flex items-center gap-1 flex-1 px-3 py-2 rounded-md text-sm transition-colors ${
                          userVote === 'dislike'
                            ? 'bg-[#f26f5e] text-white hover:bg-[#ff8270]'
                            : 'border border-[#2a2a2a] bg-transparent text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
                        } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-lg">↓</span>
                        {dislikes}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
