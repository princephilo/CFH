import React, { useEffect, useState } from 'react';
import { FiMessageSquare, FiPlus, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import './Forum.css';

const Forum = () => {
  const { isAuthenticated } = useAuth();

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/forum');
      if (Array.isArray(res.data.data)) {
        setPosts(res.data.data);
      } else {
        setPosts([]);
      }
    } catch (error) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      return toast.error('Please log in to create a forum post');
    }

    try {
      await API.post('/forum', {
        title: formData.title,
        content: formData.content,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });

      toast.success('Forum post created');
      setFormData({ title: '', content: '', tags: '' });
      setShowForm(false);
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  const filteredPosts = posts.filter(post => {
    const q = search.toLowerCase();
    return (
      post.title?.toLowerCase().includes(q) ||
      post.content?.toLowerCase().includes(q) ||
      post.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="page-container forum-page">
      <div className="forum-header">
        <div>
          <h1><FiMessageSquare /> Community Forum</h1>
          <p>Discuss circuit problems, share insights, and help others troubleshoot.</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowForm(prev => !prev)}>
          <FiPlus /> {showForm ? 'Close' : 'New Post'}
        </button>
      </div>

      <div className="forum-toolbar">
        <div className="forum-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search forum posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {showForm && (
        <form className="forum-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Post Title</label>
            <input
              type="text"
              className="input-field"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              className="input-field"
              rows="6"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              className="input-field"
              placeholder="pcb, opamp, power-supply"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            />
          </div>

          <button type="submit" className="btn btn-primary">Publish Post</button>
        </form>
      )}

      {loading ? (
        <div className="forum-empty">Loading forum posts...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="forum-empty">No forum posts found.</div>
      ) : (
        <div className="forum-posts">
          {filteredPosts.map((post) => (
            <div className="forum-post-card" key={post._id}>
              <h3>{post.title}</h3>
              <p className="forum-post-meta">
                by {post.author?.name || 'Community Member'} • {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <p className="forum-post-content">{post.content}</p>
              <div className="forum-tags">
                {post.tags?.map((tag, index) => (
                  <span className="forum-tag" key={index}>#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Forum;