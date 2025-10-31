import { useEffect, useState } from 'react';
import { getUserId } from '../utils/userId';

export default function Community() {
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

    try {
      const res = await fetch(`/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, voteType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to vote');
      }

      // Update user's vote state
      setUserVotes(prev => ({
        ...prev,
        [postId]: data.userVote,
      }));

      // Refresh posts to get updated counts and sorting
      await fetchPosts();
    } catch (err) {
      console.error('Error voting:', err);
      alert('Failed to vote. Please try again.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-red-500">Your Community</h1>
          <div className="text-center py-12">
            <p className="text-light-gray">Loading posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Community</h1>
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchPosts}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Community</h1>
          <p className="text-gray-400">Discover trending concerts and verified community recommendations</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg mb-4">No posts yet.</p>
            <p className="text-gray-500">Be the first to share a concert event!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 w-full">
            {posts.map((post) => {
              const userVote = userVotes[post._id];
              const isVoting = votingPostId === post._id;
              const likes = post.likes || 0;
              const dislikes = post.dislikes || 0;

              return (
                <div
                  key={post._id}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden hover:border-[#ff6b35] transition-colors cursor-pointer group flex flex-col"
                >
                  <div className="p-4 flex-1 flex flex-col">
                    {/* Genre Badge */}
                    <p className="text-xs text-[#ff6b35] font-semibold mb-1 uppercase">
                      {post.genre}
                    </p>

                    {/* Event Title */}
                    <h3 className="font-bold text-lg mb-1 line-clamp-2 text-white">
                      {post.eventTitle}
                    </h3>

                    {/* Artist Name */}
                    <p className="text-sm text-gray-400 mb-3">{post.artistName}</p>

                    {/* Date, Venue, Location */}
                    <div className="space-y-2 text-sm text-gray-400 mb-4">
                      <p>{formatDate(post.date)}</p>
                      <p>{post.venue}</p>
                      <p>{post.city}, {post.state}</p>
                    </div>

                    {/* Voting Section */}
                    <div className="border-t border-[#2a2a2a] pt-4 mt-auto">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(post._id, 'like');
                          }}
                          disabled={isVoting}
                          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                            userVote === 'like'
                              ? 'bg-green-600 text-white'
                              : 'bg-[#0f0f0f] text-white hover:bg-green-600/20'
                          } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{
                            border: '1px solid #2a2a2a'
                          }}
                        >
                          <span>👍</span>
                          <span className="text-sm">{likes}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVote(post._id, 'dislike');
                          }}
                          disabled={isVoting}
                          className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                            userVote === 'dislike'
                              ? 'bg-red-600 text-white'
                              : 'bg-[#0f0f0f] text-white hover:bg-red-600/20'
                          } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{
                            border: '1px solid #2a2a2a'
                          }}
                        >
                          <span>👎</span>
                          <span className="text-sm">{dislikes}</span>
                        </button>

                        {isVoting && (
                          <span className="text-xs text-gray-500">Voting...</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
