import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChip } from 'react-icons/hi';
import { FiGithub, FiMail, FiHeart } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <HiOutlineChip /> Circuit Fix Hub
          </div>
          <p className="footer-description">
            Making circuit troubleshooting smarter, faster, and more accessible
            through community collaboration and AI.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/forum">Forum</Link>
          <Link to="/leaderboard">Leaderboard</Link>
        </div>

        <div className="footer-section">
          <h4>Resources</h4>
          <a href="#help">Help Center</a>
          <a href="#docs">Documentation</a>
          <a href="#api">API</a>
        </div>

        <div className="footer-section">
          <h4>Connect</h4>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <FiGithub /> GitHub
          </a>
          <a href="mailto:contact@circuitfixhub.com">
            <FiMail /> Contact
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          Made with <FiHeart className="heart-icon" /> by Circuit Fix Hub Team
          © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
};

export default Footer;