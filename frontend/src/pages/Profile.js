// Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/listings/user/my'),
      axios.get(`/api/reviews/user/${user._id}`)
    ]).then(([l, r]) => {
      setListings(l.data);
      setReviews(r.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="full-loader"><div className="spinner" /></div>;

  return (
    <div className="page page-with-nav">
      {/* Profile header */}
      <div className="card" style={{ padding: 32, marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center' }}>
        <div className="avatar avatar-xl">{user.name?.[0]}</div>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: '1.6rem', fontWeight: 800 }}>{user.name}</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 8 }}>{user.email}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {user.department && <span className="badge badge-teal">🎓 {user.department}</span>}
            {user.year && <span className="badge badge-muted">{user.year}</span>}
            <span className="badge badge-muted">{user.role}</span>
            {user.rating > 0 && <span className="badge badge-amber">⭐ {user.rating} ({user.totalReviews} reviews)</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Items Listed', value: listings.length, icon: '📦' },
          { label: 'Rating', value: user.rating > 0 ? `${user.rating}★` : 'N/A', icon: '⭐' },
          { label: 'Reviews', value: reviews.length, icon: '💬' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Syne', fontSize: '1.6rem', fontWeight: 800, color: 'var(--teal)' }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* My listings */}
      <h2 className="section-heading" style={{ marginBottom: 16 }}>My Listings</h2>
      {listings.length === 0 ? (
        <div className="empty-state"><div className="emoji">📦</div><p>You haven't posted any items yet.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {listings.map(l => (
            <div key={l._id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: 'var(--faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {l.photos?.[0] ? <img src={l.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>📦</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{l.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>₹{l.pricePerDay}/day · {l.category}</div>
              </div>
              <span className={`badge ${l.isAvailable ? 'badge-emerald' : 'badge-muted'}`}>
                {l.isAvailable ? 'Available' : 'Unavailable'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reviews */}
      <h2 className="section-heading" style={{ marginBottom: 16 }}>Reviews</h2>
      {reviews.length === 0 ? (
        <div className="empty-state"><div className="emoji">⭐</div><p>No reviews yet.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reviews.map(r => (
            <div key={r._id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <div className="avatar avatar-sm">{r.reviewer?.name?.[0]}</div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.reviewer?.name}</div>
                <div className="stars" style={{ marginLeft: 'auto' }}>{'★'.repeat(r.rating)}</div>
              </div>
              {r.comment && <p style={{ fontSize: '0.85rem', color: 'var(--ink-3)' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
