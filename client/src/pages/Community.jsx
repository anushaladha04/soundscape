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
        month: 'long',
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
          <h1 className="text-3xl font-bold mb-8">Your Community</h1>
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
    <div className="min-h-screen bg-dark text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Community</h1>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-light-gray text-lg mb-4">No posts yet.</p>
            <p className="text-medium-gray">Be the first to share a concert event!</p>
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
                  className="bg-medium-gray border border-light-gray rounded-lg p-6 hover:border-primary transition-colors"
                >
                  <h2 className="text-xl font-bold mb-2 text-primary">{post.eventTitle}</h2>
                  <p className="text-lg font-semibold mb-1">{post.artistName}</p>
                  <p className="text-sm text-light-gray mb-4">{post.genre}</p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-primary">📅</span>
                      <div>
                        <p className="font-medium">{formatDate(post.date)}</p>
                        <p className="text-light-gray">{post.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="text-primary">📍</span>
                      <div>
                        <p className="font-medium">{post.venue}</p>
                        <p className="text-light-gray">
                          {post.address}, {post.city}, {post.state}
                          {post.zipCode && ` ${post.zipCode}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Voting Section */}
                  <div className="border-t border-light-gray pt-4 mt-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleVote(post._id, 'like')}
                        disabled={isVoting}
                        className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                          userVote === 'like'
                            ? 'bg-green-600 text-white'
                            : 'bg-dark text-white hover:bg-green-600/20'
                        } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{
                          backgroundColor: userVote === 'like' ? '#16a34a' : '#0f0f0f',
                          border: '1px solid #2a2a2a'
                        }}
                      >
                        <span>👍</span>
                        <span>{likes}</span>
                      </button>

                      <button
                        onClick={() => handleVote(post._id, 'dislike')}
                        disabled={isVoting}
                        className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                          userVote === 'dislike'
                            ? 'bg-red-600 text-white'
                            : 'bg-dark text-white hover:bg-red-600/20'
                        } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{
                          backgroundColor: userVote === 'dislike' ? '#dc2626' : '#0f0f0f',
                          border: '1px solid #2a2a2a'
                        }}
                      >
                        <span>👎</span>
                        <span>{dislikes}</span>
                      </button>

                      {isVoting && (
                        <span className="text-sm text-light-gray">Voting...</span>
                      )}
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
