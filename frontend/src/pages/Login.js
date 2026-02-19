import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-icon">🏫</div>
          <h1 className="brand-name">CampusConnect</h1>
          <p className="brand-tagline">Your college's marketplace & event hub</p>
        </div>
        <div className="auth-features">
          {['Rent items from fellow students', 'Discover campus events & lectures', 'Chat in real-time, book in seconds', 'College-exclusive, trusted community'].map((f, i) => (
            <div key={i} className="auth-feature">
              <span className="feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div className="auth-blob" />
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in with your college email</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">College Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="form-input"
                placeholder="firstname.lastnameyear@vitstudent.ac.in"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                className="form-input"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner-sm" /> : 'Sign In →'}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
