import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_LABELS = { pending: '⏳ Pending', confirmed: '✅ Confirmed', rejected: '❌ Rejected', completed: '🏁 Completed', cancelled: '🚫 Cancelled' };

export default function Bookings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('received'); // received | sent
  const [bookings, setBookings] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/bookings/my')
      .then(r => setBookings(r.data))
      .catch(() => toast.error('Failed to load bookings.'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(`/api/bookings/${id}`, { status });
      setBookings(prev => ({
        sent:     prev.sent.map(b => b._id === id ? data : b),
        received: prev.received.map(b => b._id === id ? data : b),
      }));
      toast.success(`Booking ${status}!`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
  };

  const list = bookings[tab] || [];

  return (
    <div className="page page-with-nav">
      <h1 className="section-heading">My Bookings</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--faint)', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {['received', 'sent'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: '8px 20px', border: 'none', borderRadius: 8,
              background: tab === t ? 'white' : 'transparent',
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'var(--teal)' : 'var(--muted)',
              cursor: 'pointer', fontSize: '0.875rem',
              boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s'
            }}>
            {t === 'received' ? '📥 Received' : '📤 Sent'}
            <span style={{ marginLeft: 6, background: 'var(--teal-glow)', color: 'var(--teal)', borderRadius: 10, padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700 }}>
              {bookings[t]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="full-loader" style={{ minHeight: 300 }}><div className="spinner" /></div>
      ) : list.length === 0 ? (
        <div className="empty-state"><div className="emoji">📭</div><p>No {tab} bookings yet.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {list.map((b, i) => (
            <div key={b._id} className="card fade-in" style={{ padding: 20, animationDelay: `${i * 0.04}s` }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                {/* Item thumbnail */}
                <div style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {b.listing?.photos?.[0]
                    ? <img src={b.listing.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '2rem' }}>📦</span>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Syne', fontSize: '1rem', cursor: 'pointer' }}
                        onClick={() => navigate(`/listings/${b.listing?._id}`)}>
                        {b.listing?.title}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                        {tab === 'received' ? `From: ${b.borrower?.name}` : `Owner: ${b.owner?.name}`}
                      </div>
                    </div>
                    <span className={`badge badge status-${b.status}`}>{STATUS_LABELS[b.status]}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: '0.82rem', color: 'var(--muted)' }}>
                    <span>📅 {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</span>
                    <span>🕐 {b.totalDays} day{b.totalDays > 1 ? 's' : ''}</span>
                    <span style={{ fontWeight: 700, color: 'var(--teal)' }}>₹{b.totalPrice}</span>
                  </div>

                  {b.message && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 8, fontStyle: 'italic' }}>
                      "{b.message}"
                    </p>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    {tab === 'received' && b.status === 'pending' && (
                      <>
                        <button className="btn btn-sm" style={{ background: '#dcfce7', color: '#15803d' }} onClick={() => updateStatus(b._id, 'confirmed')}>✅ Confirm</button>
                        <button className="btn btn-sm btn-danger" onClick={() => updateStatus(b._id, 'rejected')}>❌ Reject</button>
                      </>
                    )}
                    {tab === 'received' && b.status === 'confirmed' && (
                      <button className="btn btn-sm" style={{ background: '#e0f2fe', color: '#0369a1' }} onClick={() => updateStatus(b._id, 'completed')}>🏁 Mark Complete</button>
                    )}
                    {tab === 'sent' && b.status === 'pending' && (
                      <button className="btn btn-sm btn-danger" onClick={() => updateStatus(b._id, 'cancelled')}>🚫 Cancel</button>
                    )}
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => navigate(`/messages/${tab === 'received' ? b.borrower?._id : b.owner?._id}`)}>
                      💬 Message
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
