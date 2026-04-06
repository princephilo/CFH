import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowUp, FiArrowDown, FiMessageCircle,
  FiEye, FiClock
} from 'react-icons/fi';
import './IssueCard.css';

const IssueCard = ({ issue }) => {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const statusColors = {
    'open': 'badge-success',
    'in-progress': 'badge-warning',
    'resolved': 'badge-primary',
    'closed': 'badge-danger'
  };

  const priorityColors = {
    'low': '#10b981',
    'medium': '#fbbf24',
    'high': '#f97316',
    'critical': '#ef4444'
  };

  return (
    <Link to={`/issues/${issue._id}`} className="issue-card">
      <div className="issue-card-votes">
        <FiArrowUp />
        <span className="vote-count">
          {(issue.upvotes?.length || 0) - (issue.downvotes?.length || 0)}
        </span>
        <FiArrowDown />
      </div>

      <div className="issue-card-content">
        <div className="issue-card-header">
          <span className={`badge ${statusColors[issue.status]}`}>
            {issue.status}
          </span>
          <span
            className="priority-dot"
            style={{ backgroundColor: priorityColors[issue.priority] }}
            title={`Priority: ${issue.priority}`}
          />
          <span className="issue-category">{issue.category}</span>
        </div>

        <h3 className="issue-card-title">{issue.title}</h3>

        <p className="issue-card-description">
          {issue.description?.substring(0, 150)}
          {issue.description?.length > 150 ? '...' : ''}
        </p>

        <div className="issue-card-tags">
          {issue.tags?.slice(0, 4).map((tag, i) => (
            <span key={i} className="tag">#{tag}</span>
          ))}
        </div>

        <div className="issue-card-meta">
          <div className="meta-left">
            <span className="meta-author">
              <div className="mini-avatar">
                {issue.author?.username?.[0]?.toUpperCase() || '?'}
              </div>
              {issue.author?.username || 'Unknown'}
            </span>
            <span className="meta-item">
              <FiClock /> {timeAgo(issue.createdAt)}
            </span>
          </div>
          <div className="meta-right">
            <span className="meta-item">
              <FiMessageCircle /> {issue.solutions || 0}
            </span>
            <span className="meta-item">
              <FiEye /> {issue.views || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default IssueCard;