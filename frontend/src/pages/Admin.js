import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    axios.get('/api/admin/stats').then(r => setStats(r.data));
    axios.get('/api/admin/users').then(r => setUsers(r.data));
    axios.get('/api/admin/listings').then(r => setListings(r.data));
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    await axios.delete(`/api/admin/users/${id}`);
    setUsers(u => u.filter(x => x._id !== id));
    toast.success('User deleted.');
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    await axios.delete(`/api/admin/listings/${id}`);
    setListings(l => l.filter(x => x._id !== id));
    toast.success('Listing removed.');
  };

  const changeRole = async (id, role) => {
    await axios.patch(`/api/admin/users/${id}`, { role });
    setUsers(u => u.map(x => x._id === id ? { ...x, role } : x));
    toast.success('Role updated.');
  };

  return (
    <div className="page page-with-nav">
      <h1 className="section-heading">Admin Panel</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['overview', 'users', 'listings'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'} btn-sm`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {[
            { label: 'Total Users', value: stats.users, icon: '👥', color: 'var(--teal)' },
            { label: 'Listings', value: stats.listings, icon: '📦', color: 'var(--amber)' },
            { label: 'All Bookings', value: stats.bookings, icon: '📅', color: 'var(--emerald)' },
            { label: 'Active Bookings', value: stats.activeBookings, icon: '✅', color: 'var(--emerald)' },
            { label: 'Events', value: stats.events, icon: '🎉', color: 'var(--rose)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem' }}>{s.icon}</div>
              <div style={{ fontFamily: 'Syne', fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(u => (
            <div key={u._id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar avatar-md">{u.name?.[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{u.email} · {u.department}</div>
              </div>
              <select value={u.role} onChange={e => changeRole(u._id, e.target.value)}
                style={{ padding: '4px 8px', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}>
                <option value="student">student</option>
                <option value="organizer">organizer</option>
                <option value="admin">admin</option>
              </select>
              <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>🗑</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'listings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {listings.map(l => (
            <div key={l._id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', background: 'var(--faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {l.photos?.[0] ? <img src={l.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{l.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>by {l.owner?.name} · ₹{l.pricePerDay}/day</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => deleteListing(l._id)}>🗑 Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
