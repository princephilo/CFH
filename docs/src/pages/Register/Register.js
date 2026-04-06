import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import { HiOutlineChip } from 'react-icons/hi';
import './Register.css';

const SPECIALIZATIONS = [
  'analog', 'digital', 'power', 'rf',
  'microcontroller', 'pcb', 'embedded', 'iot'
];

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    specializations: []
  });

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSpecialization = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        specializations: formData.specializations
      };

      console.log('REGISTER PAYLOAD:', payload);

      await register(payload);

      toast.success('Welcome to Circuit Fix Hub!');
      navigate('/dashboard');
    } catch (error) {
      console.log('REGISTER ERROR FULL:', error);
      console.log('REGISTER ERROR RESPONSE:', error.response);
      console.log('REGISTER ERROR DATA:', error.response?.data);
      console.log('REGISTER ERROR MESSAGE:', error.message);

      toast.error(
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        error.message ||
        'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <HiOutlineChip className="auth-logo" />
          <h2>Join Circuit Fix Hub</h2>
          <p>Create your account and start solving</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label><FiUser /> Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              minLength={3}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label><FiMail /> Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label><FiLock /> Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
              minLength={6}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label><FiLock /> Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label>Specializations (optional)</label>
            <div className="spec-grid">
              {SPECIALIZATIONS.map((spec) => (
                <button
                  key={spec}
                  type="button"
                  className={`spec-chip ${formData.specializations.includes(spec) ? 'active' : ''}`}
                  onClick={() => toggleSpecialization(spec)}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span
                className="spinner"
                style={{ width: 20, height: 20, borderWidth: 2 }}
              ></span>
            ) : (
              <>
                <FiUserPlus /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;