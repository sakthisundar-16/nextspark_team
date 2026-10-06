import React from 'react';
import { NSRegistration } from '../ns-types';
import { getStatusBg, getStatusColor } from '../NSApp';
import { Calendar, MapPin, Trophy, Award, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  myRegs: NSRegistration[];
  onRefresh: () => void;
  onOpenEvent: (id: string) => void;
}

export function NSMyEventsPage({ myRegs, onRefresh, onOpenEvent }: Props) {
  const upcoming = myRegs.filter(r => ['Open', 'Ongoing', 'Closed'].includes(r.event_status || ''));
  const completed = myRegs.filter(r => r.event_status === 'Completed');

  const RegCard = ({ reg }: { reg: NSRegistration }) => (
    <div
      onClick={() => reg.event_id && onOpenEvent(reg.event_id)}
      style={{
        background: 'rgba(22, 30, 49, 0.7)',
        borderRadius: 18,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="ns-card-interactive"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                background: getStatusBg(reg.event_status || ''),
                color: getStatusColor(reg.event_status || ''),
              }}
            >
              {reg.event_status}
            </span>
            {reg.category && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#a5b4fc',
                }}
              >
                {reg.category}
              </span>
            )}
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Host: {reg.college_name || 'Autonomous Institution'}
            </span>
          </div>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
            {reg.event_title}
          </h3>

          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Calendar size={13} color="#6366f1" />
              {reg.start_date ? new Date(reg.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={13} color="#06b6d4" />
              {reg.venue || 'Campus Main Stage'}
            </span>
          </div>

          {(reg.team_name || reg.project_title) && (
            <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {reg.team_name && (
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 6 }}>
                  👥 Team: <strong>{reg.team_name}</strong>
                </span>
              )}
              {reg.project_title && (
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 6 }}>
                  💡 Submission: <strong>{reg.project_title}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Status / Result Badge */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {reg.position ? (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.08) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: 12,
                padding: '10px 16px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.68rem', color: '#fde68a', fontWeight: 700, textTransform: 'uppercase' }}>Official Merit</div>
              <div style={{ fontWeight: 900, color: '#fbbf24', fontSize: '1rem', marginTop: 2 }}>
                🏆 {reg.position}
              </div>
              {reg.certificate_id && (
                <div style={{ marginTop: 4, fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>
                  ✓ E-Cert Ready
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 10,
                padding: '8px 14px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Registration Status</div>
              <div style={{ fontWeight: 700, color: '#a5b4fc', fontSize: '0.85rem' }}>{reg.status}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            My Registered Competitions
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            Track active schedules, announcements, assigned round numbers, and competition results.
          </p>
        </div>
        <button onClick={onRefresh} className="btn-brand-secondary">
          ↻ Refresh List
        </button>
      </div>

      {myRegs.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '70px 24px',
            background: 'rgba(22, 30, 49, 0.7)',
            borderRadius: 20,
            border: '1px dashed rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚀</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
            No Active Registrations
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            You haven't signed up for any events yet. Explore open competitions to get started!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {upcoming.length > 0 && (
            <div>
              <h2 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>
                Upcoming & In Progress ({upcoming.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {upcoming.map(r => <RegCard key={r.id} reg={r} />)}
              </div>
            </div>
          )}

          {completed.length > 0 && (
            <div>
              <h2 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' }}>
                Concluded Events ({completed.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {completed.map(r => <RegCard key={r.id} reg={r} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
