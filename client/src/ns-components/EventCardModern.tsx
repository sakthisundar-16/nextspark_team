import React from 'react';
import { NSEvent } from '../ns-types';
import { Calendar, MapPin, Trophy, Users, ArrowUpRight } from 'lucide-react';
import { getStatusBg, getStatusColor } from '../NSApp';

interface Props {
  event: NSEvent;
  onClick: () => void;
}

export function EventCardModern({ event, onClick }: Props) {
  const catColors: Record<string, { bg: string; text: string }> = {
    Technical: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
    Cultural: { bg: 'rgba(236,72,153,0.15)', text: '#f472b6' },
    Sports: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
    Management: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
    Literary: { bg: 'rgba(20,184,166,0.15)', text: '#2dd4bf' },
  };

  const currentCat = catColors[event.category] || { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' };

  return (
    <div className="ns-event-card-modern" onClick={onClick}>
      {/* Visual Image / Banner Layer */}
      <div
        className="ns-event-card-banner"
        style={{
          background: event.banner_gradient || 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: 6,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {event.event_type}
          </span>
          <span
            style={{
              fontSize: '0.66rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: getStatusBg(event.status),
              color: getStatusColor(event.status),
            }}
          >
            {event.status}
          </span>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <ArrowUpRight size={15} />
        </div>
      </div>

      {/* Content Details */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 999,
              background: currentCat.bg,
              color: currentCat.text,
            }}
          >
            {event.category}
          </span>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 500 }}>
            {event.college_code || event.college_name?.split(' ')[0]}
          </span>
        </div>

        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 800,
            color: '#f8fafc',
            margin: '0 0 6px',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
          }}
        >
          {event.title}
        </h3>

        <p
          style={{
            fontSize: '0.8rem',
            color: '#94a3b8',
            margin: '0 0 14px',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description || 'Inter-college competition with live scoring rubric and certificates.'}
        </p>

        {/* Footer Metrics */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={13} color="#94a3b8" />
            <span>
              {new Date(event.start_date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
              })}
            </span>
          </div>

          {event.prize_pool ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#fbbf24' }}>
              <Trophy size={13} />
              <span>{event.prize_pool}</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontWeight: 600 }}>
              <Users size={13} />
              <span>{event.registration_count || 0} registered</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
