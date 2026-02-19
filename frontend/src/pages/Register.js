import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'MBA', 'Arts', 'Commerce', 'Other'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', year: '' });
  const [loading, setLoading] = useState(false);

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', form);
      login(data.user, data.token);
      toast.success('Account created! Welcome to CampusConnect 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="brand-icon">🏫</div>
          <h1 className="brand-name">CampusConnect</h1>
          <p className="brand-tagline">Join your college community today</p>
        </div>
        <div className="auth-features">
          {['Only college students can join', 'Post items & earn from your stuff', 'Never miss a campus event again', 'Build trust with ratings & reviews'].map((f, i) => (
            <div key={i} className="auth-feature">
              <span className="feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
        <div className="auth-blob" />
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtitle">Use your college email to register</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={onChange}
                className="form-input" placeholder="vinay kumar" required />
            </div>
            <div className="form-group">
              <label className="form-label">College Email</label>
              <input type="email" name="email" value={form.email} onChange={onChange}
                className="form-input" placeholder="vinay.kumar2024@vitstudent.ac.in" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select name="department" value={form.department} onChange={onChange} className="form-input">
                  <option value="">Select...</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <select name="year" value={form.year} onChange={onChange} className="form-input">
                  <option value="">Select...</option>
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={onChange}
                className="form-input" placeholder="Min. 6 characters" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner-sm" /> : 'Create Account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
