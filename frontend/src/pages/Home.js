import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const CATEGORY_ICONS = { books: '📚', electronics: '💻', sports: '⚽', clothing: '👕', stationery: '✏️', musical: '🎸', other: '📦' };

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/listings?available=true'),
      axios.get('/api/events')
    ]).then(([l, e]) => {
      setListings(l.data.slice(0, 6));
      setEvents(e.data.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? 'Good morning' : greetHour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0];

  if (loading) return <div className="full-loader"><div className="spinner" /></div>;

  return (
    <div className="page page-with-nav home-page">

      {/* Hero */}
      <section className="home-hero fade-in">
        <div className="hero-text">
          <p className="hero-greeting">{greeting}, {firstName} 👋</p>
          <h1 className="hero-title">What are you<br /><span>looking for today?</span></h1>
        </div>
        <div className="hero-actions">
          <button className="hero-action-card" onClick={() => navigate('/listings')}>
            <span className="hac-icon">📦</span>
            <span className="hac-label">Browse Rentals</span>
            <span className="hac-sub">Find items to borrow</span>
          </button>
          <button className="hero-action-card" onClick={() => navigate('/listings/create')}>
            <span className="hac-icon">➕</span>
            <span className="hac-label">Post an Item</span>
            <span className="hac-sub">Earn ₹ from your stuff</span>
          </button>
          <button className="hero-action-card" onClick={() => navigate('/events')}>
            <span className="hac-icon">🎉</span>
            <span className="hac-label">Events</span>
            <span className="hac-sub">What's happening</span>
          </button>
          <button className="hero-action-card" onClick={() => navigate('/bookings')}>
            <span className="hac-icon">📅</span>
            <span className="hac-label">My Bookings</span>
            <span className="hac-sub">Sent & received</span>
          </button>
        </div>
      </section>

      {/* Latest Rentals */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-heading">Latest Rentals</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/listings')}>See all →</button>
        </div>
        {listings.length === 0 ? (
          <div className="empty-state"><div className="emoji">📦</div><p>No listings yet. Be the first to post!</p></div>
        ) : (
          <div className="grid-3">
            {listings.map((l, i) => (
              <div
                key={l._id}
                className="card listing-card fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
                onClick={() => navigate(`/listings/${l._id}`)}
              >
                <div className="listing-img">
                  {l.photos?.[0]
                    ? <img src={l.photos[0]} alt={l.title} />
                    : <div className="listing-img-placeholder">{CATEGORY_ICONS[l.category] || '📦'}</div>
                  }
                  <span className="listing-price">₹{l.pricePerDay}/day</span>
                </div>
                <div className="listing-body">
                  <div className="listing-category">{l.category}</div>
                  <h3 className="listing-title">{l.title}</h3>
                  <div className="listing-meta">
                    <div className="listing-owner">
                      <div className="avatar avatar-sm">{l.owner?.name?.[0]}</div>
                      <span>{l.owner?.name}</span>
                    </div>
                    <span className="listing-location">📍 {l.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Events */}
      <section className="home-section">
        <div className="section-header">
          <h2 className="section-heading">Upcoming Events</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/events')}>See all →</button>
        </div>
        {events.length === 0 ? (
          <div className="empty-state"><div className="emoji">🎉</div><p>No upcoming events.</p></div>
        ) : (
          <div className="events-row">
            {events.map((ev, i) => {
              const d = new Date(ev.dateTime);
              return (
                <div key={ev._id} className="event-card fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="event-date-block">
                    <span className="event-day">{d.getDate()}</span>
                    <span className="event-month">{d.toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                  </div>
                  <div className="event-info">
                    <span className={`badge badge-teal`}>{ev.category}</span>
                    <h3>{ev.title}</h3>
                    <p>📍 {ev.venue} · {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="event-interested">👥 {ev.interested?.length || 0} interested</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
