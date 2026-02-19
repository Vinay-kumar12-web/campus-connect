import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          <span className="logo-icon">🏫</span>
          <span className="logo-text">Campus<strong>Connect</strong></span>
        </NavLink>

        {/* Desktop links */}
        <div className="navbar-links">
          <NavLink to="/"         className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'} end>Home</NavLink>
          <NavLink to="/listings" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Rentals</NavLink>
          <NavLink to="/events"   className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Events</NavLink>
          <NavLink to="/bookings" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Bookings</NavLink>
          <NavLink to="/messages" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Messages</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Admin</NavLink>
          )}
        </div>

        {/* Right side */}
        <div className="navbar-right">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/listings/create')}>
            + Post Item
          </button>
          <div className="avatar-menu" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="avatar avatar-sm">{initials}</div>
            {menuOpen && (
              <div className="dropdown">
                <div className="dropdown-user">
                  <div className="dropdown-name">{user?.name}</div>
                  <div className="dropdown-email">{user?.email}</div>
                </div>
                <hr />
                <button onClick={() => { navigate('/profile'); setMenuOpen(false); }}>👤 Profile</button>
                <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
              </div>
            )}
          </div>

          {/* Hamburger for mobile */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {['/', '/listings', '/events', '/bookings', '/messages', '/profile'].map((path, i) => {
            const labels = ['Home', 'Rentals', 'Events', 'Bookings', 'Messages', 'Profile'];
            return (
              <NavLink key={path} to={path} onClick={() => setMenuOpen(false)} className="mobile-link">
                {labels[i]}
              </NavLink>
            );
          })}
          <button onClick={handleLogout} className="mobile-link" style={{ color: 'var(--rose)', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }}>Logout</button>
        </div>
      )}
    </nav>
  );
}
