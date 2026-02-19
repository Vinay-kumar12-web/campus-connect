import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Listings.css';

const CATEGORIES = ['all', 'books', 'electronics', 'sports', 'clothing', 'stationery', 'musical', 'other'];
const ICONS = { books: '📚', electronics: '💻', sports: '⚽', clothing: '👕', stationery: '✏️', musical: '🎸', other: '📦', all: '🔍' };

export default function Listings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const fetchListings = async () => {
    setLoading(true);
    try {
      let url = '/api/listings?available=true';
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category !== 'all') url += `&category=${category}`;
      const { data } = await axios.get(url);
      setListings(data);
    } catch { toast.error('Failed to load listings.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="page page-with-nav">
      {/* Header */}
      <div className="listings-header">
        <h1 className="section-heading" style={{ marginBottom: 0 }}>Browse Rentals</h1>
        <button className="btn btn-primary" onClick={() => navigate('/listings/create')}>+ Post Item</button>
      </div>

      {/* Search bar */}
      <form className="search-bar" onSubmit={handleSearch}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search for books, cameras, sports gear..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm">Search</button>
      </form>

      {/* Category pills */}
      <div className="category-pills">
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`pill ${category === c ? 'pill-active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="full-loader" style={{ minHeight: 300 }}><div className="spinner" /></div>
      ) : listings.length === 0 ? (
        <div className="empty-state"><div className="emoji">📭</div><p>No listings found. Try a different search or category.</p></div>
      ) : (
        <div className="grid-3">
          {listings.map((l, i) => (
            <div key={l._id} className="card listing-card fade-in"
              style={{ animationDelay: `${i * 0.04}s` }}
              onClick={() => navigate(`/listings/${l._id}`)}>
              <div className="listing-img">
                {l.photos?.[0]
                  ? <img src={l.photos[0]} alt={l.title} />
                  : <div className="listing-img-placeholder">{ICONS[l.category] || '📦'}</div>
                }
                <span className="listing-price">₹{l.pricePerDay}/day</span>
                {l.condition && <span className="listing-condition">{l.condition}</span>}
              </div>
              <div className="listing-body">
                <div className="listing-category">{l.category}</div>
                <h3 className="listing-title">{l.title}</h3>
                <p className="listing-desc">{l.description?.slice(0, 70)}...</p>
                <div className="listing-meta">
                  <div className="listing-owner">
                    <div className="avatar avatar-sm">{l.owner?.name?.[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{l.owner?.name}</div>
                      {l.owner?.rating > 0 && <div className="stars" style={{ fontSize: '0.7rem' }}>{'★'.repeat(Math.round(l.owner.rating))} {l.owner.rating}</div>}
                    </div>
                  </div>
                  <span className="listing-location">📍 {l.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
