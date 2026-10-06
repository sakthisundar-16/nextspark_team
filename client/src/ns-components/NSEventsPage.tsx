import React, { useState, useEffect } from 'react';
import { NSEvent, NSUser } from '../ns-types';
import { DevpostEventCard } from './DevpostEventCard';
import { Search, Filter, X, Sparkles, MapPin, Calendar, Trophy, ChevronRight } from 'lucide-react';

const API = 'http://localhost:5001/api2';

interface Props {
  token: string;
  currentUser: NSUser;
  onOpenEvent: (id: string) => void;
}

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Management', 'Literary'];

export function NSEventsPage({ token, currentUser, onOpenEvent }: Props) {
  const [events, setEvents] = useState<NSEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [mode, setMode] = useState('All');

  useEffect(() => {
    setLoading(true);
    let url = `${API}/events?`;
    if (category !== 'All') url += `category=${category}&`;
    fetch(url)
      .then(r => r.json())
      .then(d => {
        setEvents(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  const filtered = events.filter(e => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.college_name?.toLowerCase().includes(q) ||
      e.event_type?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q);
    const matchMode = mode === 'All' || e.mode === mode;
    return matchSearch && matchMode;
  });

  const featured = events[0];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Devpost / Unstop Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          borderRadius: 20,
          padding: '36px 40px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
          flexWrap: 'wrap',
          gap: 24,
        }}
      >
        <div style={{ maxWidth: 620 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 12,
            }}
          >
            <Sparkles size={13} /> National Inter-College Arena
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 900,
              margin: '0 0 10px',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Find Your Next Hackathon & Competition
          </h1>
          <p style={{ fontSize: '0.96rem', opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
            Join premier college tournaments, build ground-breaking solutions, present to live juries, and claim verified certificates.
          </p>
        </div>

        {featured && (
          <div
            onClick={() => onOpenEvent(featured.id)}
            style={{
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 16,
              padding: '18px 22px',
              maxWidth: 320,
              cursor: 'pointer',
              boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
            }}
          >
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#2563eb',
                textTransform: 'uppercase',
                background: '#eff6ff',
                padding: '3px 8px',
                borderRadius: 4,
              }}
            >
              Featured Spotlight
            </span>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', margin: '8px 0 4px', color: '#0f172a' }}>
              {featured.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 10 }}>
              {featured.college_name} · 🏆 {featured.prize_pool || 'Exciting Prizes'}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4 }}>
              Register Now <ChevronRight size={14} />
            </div>
          </div>
        )}
      </div>

      {/* Clean Unstop Style Search & Filter Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <Search size={17} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search hackathons, colleges, keywords..."
              style={{
                width: '100%',
                padding: '11px 14px 11px 42px',
                borderRadius: 10,
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Mode Dropdown */}
          <select
            value={mode}
            onChange={e => setMode(e.target.value)}
            style={{
              padding: '11px 14px',
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="All">All Modes</option>
            <option value="Offline">Offline (Campus)</option>
            <option value="Online">Online (Virtual)</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748b', marginRight: 4 }}>Filter:</span>
          {CATEGORIES.map(c => {
            const isSelected = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: isSelected ? '#2563eb' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: isSelected ? '1px solid #2563eb' : '1px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
          Explore Competitions ({filtered.length})
        </h2>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ height: 300, background: '#e2e8f0', borderRadius: 16 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 24px',
            background: '#ffffff',
            borderRadius: 16,
            border: '1px dashed #cbd5e1',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔍</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            No Competitions Found
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 16px' }}>
            Try resetting your search query or switching categories.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setCategory('All');
              setMode('All');
            }}
            className="btn-unstop-secondary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {filtered.map(ev => (
            <DevpostEventCard key={ev.id} event={ev} onClick={() => onOpenEvent(ev.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
