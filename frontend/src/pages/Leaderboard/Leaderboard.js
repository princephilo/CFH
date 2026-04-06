import React, { useEffect, useState } from 'react';
import { FiAward, FiTrendingUp, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import ContributorBadge from '../../components/ContributorBadge/ContributorBadge';
import './Leaderboard.css';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await API.get('/users/leaderboard');
        setUsers(res.data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="page-container leaderboard-page">
      <div className="leaderboard-header">
        <h1><FiAward /> Top Contributors</h1>
        <p>Recognizing the community members who help solve the most circuit issues.</p>
      </div>

      {loading ? (
        <div className="leaderboard-empty">Loading leaderboard...</div>
      ) : users.length === 0 ? (
        <div className="leaderboard-empty">No contributors available yet.</div>
      ) : (
        <div className="leaderboard-list">
          {users.map((member, index) => (
            <div className="leaderboard-card" key={member._id || index}>
              <div className="leaderboard-rank">#{index + 1}</div>

              <div className="leaderboard-avatar">
                {member.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              <div className="leaderboard-content">
                <h3><FiUser /> {member.name}</h3>
                <p>{member.email}</p>
                <div className="leaderboard-score">
                  <FiTrendingUp /> Reputation: {member.reputation || 0}
                </div>

                <div className="leaderboard-badges">
                  {member.badges?.length > 0 ? (
                    member.badges.map((badge, idx) => (
                      <ContributorBadge key={idx} label={badge} />
                    ))
                  ) : (
                    <span className="no-badges">No badges yet</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;