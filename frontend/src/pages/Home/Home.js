import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiZap, FiUsers, FiCpu, FiSearch,
  FiTrendingUp, FiArrowRight, FiCheckCircle
} from 'react-icons/fi';
import { HiOutlineChip } from 'react-icons/hi';
import API from '../../api/axios';
import IssueCard from '../../components/IssueCard/IssueCard';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [recentIssues, setRecentIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [issuesRes, statsRes] = await Promise.all([
        API.get('/issues?limit=6&sort=-createdAt'),
        API.get('/users/stats')
      ]);
      setRecentIssues(issuesRes.data.data.issues);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/dashboard?search=${encodeURIComponent(search)}`;
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-effects">
          <div className="hero-grid"></div>
          <div className="hero-glow"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <FiZap /> Powered by AI & Community
          </div>

          <h1 className="hero-title">
            Fix Circuits <span className="gradient-text">Faster</span>,
            <br />Together.
          </h1>

          <p className="hero-subtitle">
            Circuit Fix Hub combines AI-powered diagnostics with community expertise
            to help you diagnose and resolve circuit errors quickly and effectively.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search circuit issues, components, solutions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/submit-issue" className="btn btn-primary btn-lg">
                Submit an Issue <FiArrowRight />
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started <FiArrowRight />
              </Link>
            )}
            <Link to="/dashboard" className="btn btn-secondary btn-lg">
              Browse Issues
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="stats-section">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card">
                <FiUsers className="stat-icon" />
                <div className="stat-number">{stats.totalUsers}</div>
                <div className="stat-label">Community Members</div>
              </div>
              <div className="stat-card">
                <HiOutlineChip className="stat-icon" />
                <div className="stat-number">{stats.totalIssues}</div>
                <div className="stat-label">Issues Submitted</div>
              </div>
              <div className="stat-card">
                <FiCheckCircle className="stat-icon" />
                <div className="stat-number">{stats.resolvedIssues}</div>
                <div className="stat-label">Issues Resolved</div>
              </div>
              <div className="stat-card">
                <FiTrendingUp className="stat-icon" />
                <div className="stat-number">{stats.resolutionRate}%</div>
                <div className="stat-label">Resolution Rate</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Three simple steps to solve your circuit problems
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-number">01</div>
              <div className="feature-icon-wrap">
                <FiZap />
              </div>
              <h3>Submit Your Issue</h3>
              <p>
                Describe your circuit problem with text, upload images,
                or use our built-in circuit simulator.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-number">02</div>
              <div className="feature-icon-wrap">
                <FiCpu />
              </div>
              <h3>AI Analysis</h3>
              <p>
                Our AI analyzes your circuit, detects potential errors,
                and suggests likely fixes instantly.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-number">03</div>
              <div className="feature-icon-wrap">
                <FiUsers />
              </div>
              <h3>Community Solutions</h3>
              <p>
                Get verified solutions from experienced engineers and
                electronics enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      <section className="recent-issues-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Recent Issues</h2>
              <p className="section-subtitle">Latest circuit problems from the community</p>
            </div>
            <Link to="/dashboard" className="btn btn-secondary">
              View All <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : recentIssues.length > 0 ? (
            <div className="issues-grid">
              {recentIssues.map(issue => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No issues yet</h3>
              <p>Be the first to submit a circuit issue!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;