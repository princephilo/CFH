import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiAlertCircle, FiClock, FiTag, FiTool, FiUser, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import AIChat from '../../components/AIChat/AIChat';
import './IssueDetail.css';

const IssueDetail = () => {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const res = await API.get(`/issues/${id}`);
        setIssue(res.data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load issue');
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container issue-detail-page">
        <div className="issue-detail-loading">Loading issue...</div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="page-container issue-detail-page">
        <div className="issue-detail-error">Issue not found.</div>
      </div>
    );
  }

  return (
    <div className="page-container issue-detail-page">
      <div className="issue-detail-layout">
        <div className="issue-main-card">
          <div className="issue-header">
            <div>
              <h1>{issue.title}</h1>
              <p className="issue-meta-line">
                <span><FiUser /> {issue.author?.name || 'Unknown'}</span>
                <span><FiClock /> {new Date(issue.createdAt).toLocaleString()}</span>
              </p>
            </div>
            <span className={`status-badge status-${issue.status}`}>{issue.status}</span>
          </div>

          <div className="issue-grid">
            <div className="issue-badge"><FiAlertCircle /> Priority: {issue.priority}</div>
            <div className="issue-badge"><FiTool /> Difficulty: {issue.difficulty}</div>
            <div className="issue-badge"><FiTag /> Category: {issue.category}</div>
          </div>

          <section className="issue-section">
            <h3>Description</h3>
            <p className="issue-description">{issue.description}</p>
          </section>

          {issue.tags?.length > 0 && (
            <section className="issue-section">
              <h3>Tags</h3>
              <div className="issue-tags">
                {issue.tags.map((tag) => (
                  <span key={tag} className="issue-tag">#{tag}</span>
                ))}
              </div>
            </section>
          )}

          {issue.components?.length > 0 && (
            <section className="issue-section">
              <h3>Components</h3>
              <div className="components-wrap">
                {issue.components.map((comp, idx) => (
                  <div key={idx} className="component-item">
                    <strong>{comp.name}</strong>
                    {comp.value ? <span>{comp.value}</span> : null}
                  </div>
                ))}
              </div>
            </section>
          )}

          {issue.circuitImages?.length > 0 && (
            <section className="issue-section">
              <h3><FiImage /> Circuit Images</h3>
              <div className="issue-images">
                {issue.circuitImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}${img}`}
                    alt={`Circuit ${idx}`}
                  />
                ))}
              </div>
            </section>
          )}

          {issue.circuitData && (
            <section className="issue-section">
              <h3>Saved Circuit Data</h3>
              <pre className="circuit-data-box">
                {JSON.stringify(issue.circuitData, null, 2)}
              </pre>
            </section>
          )}

          {issue.aiSuggestions?.length > 0 && (
            <section className="issue-section">
              <h3>AI Suggestions</h3>
              <ul className="ai-suggestions-list">
                {issue.aiSuggestions.map((suggestion, idx) => (
                  <li key={idx}>{suggestion}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="issue-sidebar">
          <div className="sidebar-card">
            <h3>AI Assistant</h3>
            <p>Ask follow-up questions about this issue.</p>
            <AIChat issueId={issue._id} issueTitle={issue.title} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default IssueDetail;