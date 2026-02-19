import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './ListingDetail.css';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState({ startDate: '', endDate: '', message: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    axios.get(`/api/listings/${id}`)
      .then(r => setListing(r.data))
      .catch(() => toast.error('Listing not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const totalDays = booking.startDate && booking.endDate
    ? Math.max(1, Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / 86400000))
    : 0;

  const handleBook = async (e) => {
    e.preventDefault();
    if (!booking.startDate || !booking.endDate) return toast.error('Please select dates.');
    if (new Date(booking.endDate) <= new Date(booking.startDate)) return toast.error('End date must be after start date.');

    setBookingLoading(true);
    try {
      await axios.post('/api/bookings', {
        listingId: id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        message: booking.message
      });
      toast.success('Booking request sent! Waiting for owner to confirm.');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="full-loader"><div className="spinner" /></div>;
  if (!listing) return <div className="page page-with-nav"><p>Listing not found.</p></div>;

  const isOwner = listing.owner?._id === user?._id;

  return (
    <div className="page page-with-nav">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back
      </button>

      <div className="detail-layout">
        {/* Left: photos + info */}
        <div className="detail-left">
          {/* Photos */}
          <div className="photo-gallery">
            <div className="photo-main">
              {listing.photos?.[photoIdx]
                ? <img src={listing.photos[photoIdx]} alt={listing.title} />
                : <div className="photo-placeholder">📦</div>
              }
            </div>
            {listing.photos?.length > 1 && (
              <div className="photo-thumbs">
                {listing.photos.map((p, i) => (
                  <img key={i} src={p} alt="" className={photoIdx === i ? 'thumb-active' : ''} onClick={() => setPhotoIdx(i)} />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-top">
              <div>
                <span className="listing-category">{listing.category}</span>
                <h1 className="detail-title">{listing.title}</h1>
              </div>
              <div className="detail-price">₹{listing.pricePerDay}<span>/day</span></div>
            </div>

            <div className="detail-tags">
              <span className="badge badge-muted">📍 {listing.location}</span>
              <span className="badge badge-muted">🔧 {listing.condition}</span>
              {listing.isAvailable
                ? <span className="badge badge-emerald">✅ Available</span>
                : <span className="badge badge-rose">❌ Unavailable</span>
              }
              <span className="badge badge-muted">👁 {listing.views} views</span>
            </div>

            <p className="detail-desc">{listing.description}</p>

            {/* Owner card */}
            <div className="owner-card">
              <div className="avatar avatar-md">{listing.owner?.name?.[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{listing.owner?.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{listing.owner?.email}</div>
                {listing.owner?.rating > 0 && (
                  <div className="stars" style={{ fontSize: '0.8rem' }}>
                    {'★'.repeat(Math.round(listing.owner.rating))} {listing.owner.rating} ({listing.owner.totalReviews} reviews)
                  </div>
                )}
              </div>
              {!isOwner && (
                <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}
                  onClick={() => navigate(`/messages/${listing.owner._id}`)}>
                  💬 Chat
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: booking form */}
        <div className="detail-right">
          {isOwner ? (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 8 }}>Your listing</h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: 16 }}>You cannot book your own item.</p>
              <button className="btn btn-outline btn-full" onClick={() => navigate(`/listings/${id}/edit`)}>✏️ Edit Listing</button>
            </div>
          ) : listing.isAvailable ? (
            <div className="card booking-card">
              <div className="booking-header">
                <h3>Book this item</h3>
                <div className="booking-price">₹{listing.pricePerDay}<span>/day</span></div>
              </div>
              <form onSubmit={handleBook} className="booking-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                      value={booking.startDate}
                      onChange={e => setBooking(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-input"
                      min={booking.startDate || new Date().toISOString().split('T')[0]}
                      value={booking.endDate}
                      onChange={e => setBooking(p => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Message to owner (optional)</label>
                  <textarea className="form-input" rows={3}
                    placeholder="Hi! I need this for..."
                    value={booking.message}
                    onChange={e => setBooking(p => ({ ...p, message: e.target.value }))} />
                </div>

                {totalDays > 0 && (
                  <div className="price-calc">
                    <div className="price-row">
                      <span>₹{listing.pricePerDay} × {totalDays} day{totalDays > 1 ? 's' : ''}</span>
                      <strong>₹{listing.pricePerDay * totalDays}</strong>
                    </div>
                    <div className="price-divider" />
                    <div className="price-row price-total">
                      <span>Total</span>
                      <strong>₹{listing.pricePerDay * totalDays}</strong>
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={bookingLoading}>
                  {bookingLoading ? <span className="spinner-sm" /> : 'Send Booking Request'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Owner needs to confirm your request
                </p>
              </form>
            </div>
          ) : (
            <div className="card" style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>❌</div>
              <p>This item is currently unavailable.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
