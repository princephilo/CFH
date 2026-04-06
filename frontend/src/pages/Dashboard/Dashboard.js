import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FiSearch, FiFilter, FiPlus, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import API from '../../api/axios';
import IssueCard from '../../components/IssueCard/IssueCard';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const CATEGORIES = [
  'all', 'short-circuit', 'open-circuit', 'component-failure',
  'wrong-value', 'design-error', 'soldering-issue',
  'signal-integrity', 'power-issue', 'grounding', 'thermal', 'other'
];

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: 'all',
    status: '',
    sort: '-createdAt',
    page: 1
  });

  useEffect(() => {
    fetchIssues();
  }, [filters]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category && filters.category !== 'all') params.set('category', filters.category);
      if (filters.status) params.set('status', filters.status);
      params.set('sort', filters.sort);
      params.set('page', filters.page);
      params.set('limit', 10);

      const res = await API.get(`/issues?${params.toString()}`);
      setIssues(res.data.data.issues);
      setPagination(res.data.data.pagination);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1>Circuit Issues</h1>
          <p>Browse and solve circuit problems from the community</p>
        </div>
        {isAuthenticated && (
          <Link to="/submit-issue" className="btn btn-primary">
            <FiPlus /> Submit Issue
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="dashboard-filters">
        <form className="filter-search" onSubmit={handleSearch}>
          <FiSearch />
          <input
            type="text"
            placeholder="Search issues..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="filter-search-input"
          />
        </form>

        <div className="filter-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${filters.category === cat ? 'active' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, category: cat, page: 1 }))}
            >
              {cat === 'all' ? 'All' : cat.replace(/-/g, ' ')}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
            className="filter-select"
          >
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="-views">Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : issues.length > 0 ? (
        <>
          <div className="issues-list">
            {issues.map(issue => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                <FiChevronLeft /> Previous
              </button>

              <span className="page-info">
                Page {pagination.page} of {pagination.pages}
              </span>

              <button
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h3>No issues found</h3>
          <p>Try adjusting your filters or submit a new issue</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;