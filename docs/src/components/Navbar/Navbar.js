import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiMenu, FiX, FiHome, FiPlusCircle,
  FiMessageSquare, FiAward, FiUser, FiLogOut, FiLogIn
} from 'react-icons/fi';
import { HiOutlineChip } from 'react-icons/hi';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <HiOutlineChip className="logo-icon" />
          <span className="logo-text">Circuit Fix Hub</span>
        </Link>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            <FiHome /> Home
          </Link>

          {isAuthenticated && (
            <Link to="/submit-issue" className="nav-link" onClick={() => setMenuOpen(false)}>
              <FiPlusCircle /> Submit Issue
            </Link>
          )}

          <Link to="/forum" className="nav-link" onClick={() => setMenuOpen(false)}>
            <FiMessageSquare /> Forum
          </Link>

          <Link to="/leaderboard" className="nav-link" onClick={() => setMenuOpen(false)}>
            <FiAward /> Leaderboard
          </Link>

          {isAuthenticated ? (
            <div className="nav-user-section">
              <Link
                to={`/profile/${user?.id || user?._id}`}
                className="nav-user"
                onClick={() => setMenuOpen(false)}
              >
                <div className="nav-avatar">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="nav-username">{user?.username}</span>
                <span className="nav-points">{user?.points || 0} pts</span>
              </Link>
              <button className="nav-link logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth-section">
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>
                <FiLogIn /> Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;