import React, { useEffect, useState } from 'react';
import { FiAward, FiEdit3, FiMail, FiUser, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import ContributorBadge from '../../components/ContributorBadge/ContributorBadge';
import './Profile.css';

const Profile = () => {
  const { user, isAuthenticated, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    bio: ''
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      try {
        const res = await API.get('/auth/me');
        setProfile(res.data.data);
        setFormData({
          name: res.data.data.name || '',
          bio: res.data.data.bio || ''
        });
      } catch (error) {
        toast.error('Failed to load profile');
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const res = await API.put('/users/profile', formData);
      setProfile(res.data.data);
      if (setUser) {
        setUser((prev) => ({ ...prev, ...res.data.data }));
      }
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container profile-page">
        <div className="profile-card">
          <h2>Please log in to view your profile.</h2>
        </div>
      </div>
    );
  }

  const currentProfile = profile || user || {};

  return (
    <div className="page-container profile-page">
      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">
            {currentProfile.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="profile-info">
            <h1>{currentProfile.name}</h1>
            <p><FiMail /> {currentProfile.email}</p>
            <p><FiTrendingUp /> Reputation: {currentProfile.reputation || 0}</p>
          </div>

          <button className="btn btn-secondary" onClick={() => setEditing(prev => !prev)}>
            <FiEdit3 /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-section">
          <h3><FiUser /> Bio</h3>
          {editing ? (
            <form onSubmit={handleSave} className="profile-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  className="input-field"
                  rows="5"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <button type="submit" className="btn btn-primary">Save Changes</button>
            </form>
          ) : (
            <p className="profile-bio-text">
              {currentProfile.bio || 'No bio added yet.'}
            </p>
          )}
        </div>

        <div className="profile-section">
          <h3><FiAward /> Badges</h3>
          {currentProfile.badges?.length > 0 ? (
            <div className="profile-badges">
              {currentProfile.badges.map((badge, index) => (
                <ContributorBadge key={index} label={badge} />
              ))}
            </div>
          ) : (
            <p className="empty-text">No badges earned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;