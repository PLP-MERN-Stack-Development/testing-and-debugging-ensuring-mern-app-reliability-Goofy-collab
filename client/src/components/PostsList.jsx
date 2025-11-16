// client/src/components/PostsList.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { measurePerformance, measureAPICall } from '../utils/performanceMonitor';

function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Track component mount performance
    measurePerformance('PostsList Mount', () => {
      console.log('PostsList component mounted');
    });

    // Fetch posts when component mounts
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Measure API call performance
      const response = await measureAPICall('Fetch Posts', async () => {
        return api.get('/posts');
      });

      setPosts(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading posts...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h3>Error:</h3>
        <p>{error}</p>
        <button onClick={fetchPosts}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Posts List</h2>
      {posts.length === 0 ? (
        <p>No posts found</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map((post) => (
            <li 
              key={post._id} 
              style={{ 
                border: '1px solid #ddd', 
                padding: '1rem', 
                marginBottom: '1rem',
                borderRadius: '4px'
              }}
            >
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small>By: {post.author?.username || 'Unknown'}</small>
            </li>
          ))}
        </ul>
      )}
      <button onClick={fetchPosts} style={{ marginTop: '1rem' }}>
        Refresh Posts
      </button>
    </div>
  );
}

export default PostsList;