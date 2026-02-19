import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CATS = ['all', 'lecture', 'workshop', 'fest', 'sports', 'cultural', 'tech', 'other'];
const CAT_COLORS = { lecture: 'badge-teal', workshop: 'badge-amber', fest: 'badge-rose', sports: 'badge-emerald', cultural: 'badge-amber', tech: 'badge-teal', other: 'badge-muted' };

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'other', dateTime: '', venue: '' });
  const [saving, setSaving] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const url = cat === 'all' ? '/api/events' : `/api/events?category=${cat}`;
      const { data } = await axios.get(url);
      setEvents(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [cat]);

  const toggleInterested = async (eventId) => {
    try {
      const { data } = await axios.post(`/api/events/${eventId}/interested`);
      setEvents(ev => ev.map(e => e._id === eventId
        ? { ...e, interested: data.interested, intCount: data.count }
        : e));
    } catch { toast.error('Failed.'); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.post('/api/events', form);
      setEvents(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '', category: 'other', dateTime: '', venue: '' });
      toast.success('Event posted! 🎉');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page page-with-nav">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="section-heading" style={{ marginBottom: 0 }}>Campus Events</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Post Event'}
        </button>
      </div>

      {/* Post event form */}
      {showForm && (
        <div className="card fade-in" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Syne', marginBottom: 16 }}>New Event</h3>
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Guest Lecture on AI" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATS.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input type="datetime-local" className="form-input" value={form.dateTime} onChange={e => setForm(p => ({ ...p, dateTime: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Venue</label>
                <input className="form-input" value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} placeholder="Seminar Hall A" required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={saving}>
              {saving ? '...' : 'Post Event'}
            </button>
          </form>
        </div>
      )}

      {/* Category filter */}
      <div className="category-pills" style={{ marginBottom: 24 }}>
        {CATS.map(c => (
          <button key={c} className={`pill ${cat === c ? 'pill-active' : ''}`} onClick={() => setCat(c)}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Events grid */}
      {loading ? (
        <div className="full-loader" style={{ minHeight: 300 }}><div className="spinner" /></div>
      ) : events.length === 0 ? (
        <div className="empty-state"><div className="emoji">🎉</div><p>No events yet.</p></div>
      ) : (
        <div className="grid-2">
          {events.map((ev, i) => {
            const d = new Date(ev.dateTime);
            const isInterested = ev.interested?.includes(user?._id);
            return (
              <div key={ev._id} className="card fade-in" style={{ padding: 24, animationDelay: `${i * 0.04}s` }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ textAlign: 'center', background: 'var(--faint)', borderRadius: 10, padding: '10px 14px', minWidth: 56, flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Syne', fontSize: '1.5rem', fontWeight: 800, color: 'var(--teal)', lineHeight: 1 }}>{d.getDate()}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--teal-dark)' }}>{d.toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <span className={`badge ${CAT_COLORS[ev.category] || 'badge-muted'}`}>{ev.category}</span>
                    <h3 style={{ fontFamily: 'Syne', marginTop: 6, marginBottom: 6, fontSize: '1.05rem' }}>{ev.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 8 }}>{ev.description?.slice(0, 120)}...</p>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 12 }}>
                      <span>⏰ {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>📍 {ev.venue}</span>
                      <span>👤 {ev.organizer?.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        className={`btn btn-sm ${isInterested ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => toggleInterested(ev._id)}
                      >
                        {isInterested ? '✅ Interested' : '🔔 I\'m Interested'}
                      </button>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        {ev.interested?.length || 0} interested
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
