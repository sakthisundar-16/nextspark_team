import React from 'react';
import { NSEvent } from '../ns-types';
import { Calendar, MapPin, Trophy, Users, Building, ArrowUpRight } from 'lucide-react';

interface Props {
  event: NSEvent;
  onClick: () => void;
}

// Real curated college event banner images for authentic national competition look
const EVENT_IMAGES: Record<string, string> = {
  Technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80',
  Hackathon: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=700&q=80',
  Symposium: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=700&q=80',
  Robotics: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=700&q=80',
  Cultural: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=700&q=80',
  Management: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=80',
  Literary: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=700&q=80',
};

export function DevpostEventCard({ event, onClick }: Props) {
  // Use custom uploaded/selected image if available, else curated category banner
  const titleLower = event.title.toLowerCase();
  let imgUrl = event.image_url || EVENT_IMAGES[event.category] || EVENT_IMAGES.Technical;
  if (!event.image_url) {
    if (titleLower.includes('hackathon')) imgUrl = EVENT_IMAGES.Hackathon;
    else if (titleLower.includes('robo')) imgUrl = EVENT_IMAGES.Robotics;
    else if (titleLower.includes('symposium') || titleLower.includes('paper')) imgUrl = EVENT_IMAGES.Symposium;
  }

  const isLive = event.status === 'Ongoing';
  const isOpen = event.status === 'Open';

  return (
    <div className="devpost-card" onClick={onClick}>
      {/* Real Banner Image */}
      <div className="devpost-card-img-wrap">
        <img
          src={imgUrl}
          alt={event.title}
          className="devpost-card-img"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="devpost-card-overlay-badge">
          <span className="badge-category">
            {event.event_type}
          </span>
          <span
            className={`devpost-badge-status ${
              isLive ? 'badge-ongoing' : isOpen ? 'badge-open' : 'badge-closed'
            }`}
          >
            {isLive ? '🔴 Live Now' : isOpen ? '🟢 Open' : event.status}
          </span>
        </div>

        {/* Prize Pool Tag */}
        {event.prize_pool && (
          <div className="devpost-card-price-badge">
            <Trophy size={13} color="#fef08a" />
            <span>{event.prize_pool}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Host College Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <Building size={13} color="#64748b" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>
            {event.college_code || event.college_name?.split(' ')[0]}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>·</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            {event.category}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 8px',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
          }}
        >
          {event.title}
        </h3>

        {/* Description snippet */}
        <p
          style={{
            fontSize: '0.82rem',
            color: '#475569',
            margin: '0 0 16px',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description || 'Inter-college challenge with real-world problem statements, live jury evaluation, and certificates.'}
        </p>

        {/* Footer info row */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={13} color="#64748b" />
            <span>
              {new Date(event.start_date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 700 }}>
            <Users size={13} />
            <span>{event.registration_count || 0} registered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
