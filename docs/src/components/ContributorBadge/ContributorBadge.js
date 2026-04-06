import React from 'react';
import './ContributorBadge.css';

const ContributorBadge = ({ badge, size = 'medium' }) => {
  return (
    <div className={`contributor-badge ${size}`} title={badge.description}>
      <span className="badge-icon">{badge.icon}</span>
      <div className="badge-info">
        <span className="badge-name">{badge.name}</span>
        {size !== 'small' && (
          <span className="badge-desc">{badge.description}</span>
        )}
      </div>
    </div>
  );
};

export default ContributorBadge;