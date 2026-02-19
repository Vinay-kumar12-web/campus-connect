import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['books', 'electronics', 'sports', 'clothing', 'stationery', 'musical', 'other'];
const CONDITIONS = ['new', 'like-new', 'good', 'fair'];

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'other',
    pricePerDay: '', location: '', condition: 'good',
    photos: []   // Will be URLs; for now user enters URLs manually
  });
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const addPhoto = () => {
    if (!photoUrl.trim()) return;
    setForm(p => ({ ...p, photos: [...p.photos, photoUrl.trim()] }));
    setPhotoUrl('');
  };

  const removePhoto = (i) => setForm(p => ({ ...p, photos: p.photos.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.pricePerDay || !form.location) {
      return toast.error('Please fill all required fields.');
    }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/listings', {
        ...form,
        pricePerDay: Number(form.pricePerDay)
      });
      toast.success('Listing posted! 🎉');
      navigate(`/listings/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-with-nav">
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>← Back</button>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h1 className="section-heading">Post an Item for Rent</h1>
        <p style={{ color: 'var(--muted)', marginBottom: 28, fontSize: '0.9rem' }}>
          Fill in the details and let your college mates rent it from you!
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <h3 style={{ fontFamily: 'Syne', marginBottom: 4 }}>Basic Details</h3>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input name="title" value={form.title} onChange={onChange}
                className="form-input" placeholder='e.g. "Canon EOS 1500D DSLR Camera"' required />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea name="description" value={form.description} onChange={onChange}
                className="form-input" rows={4}
                placeholder="Describe the item — condition, what's included, any rules..." required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" value={form.category} onChange={onChange} className="form-input">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select name="condition" value={form.condition} onChange={onChange} className="form-input">
                  {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price per Day (₹) *</label>
                <input type="number" name="pricePerDay" value={form.pricePerDay} onChange={onChange}
                  className="form-input" placeholder="50" min="1" required />
              </div>
              <div className="form-group">
                <label className="form-label">Pickup Location *</label>
                <input name="location" value={form.location} onChange={onChange}
                  className="form-input" placeholder="e.g. Block B, Room 204" required />
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Syne', marginBottom: 4 }}>Photos</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 14 }}>
              Add image URLs (upload to imgur.com or cloudinary.com first)
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)}
                className="form-input" placeholder="https://..." style={{ flex: 1 }} />
              <button type="button" className="btn btn-outline" onClick={addPhoto}>+ Add</button>
            </div>
            {form.photos.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {form.photos.map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={p} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '2px solid var(--border)' }} />
                    <button type="button" onClick={() => removePhoto(i)}
                      style={{ position: 'absolute', top: -6, right: -6, background: 'var(--rose)', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : '🚀 Post Listing'}
          </button>

        </form>
      </div>
    </div>
  );
}
