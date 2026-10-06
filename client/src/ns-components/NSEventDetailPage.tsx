import React, { useState, useEffect } from 'react';
import { NSEvent, NSUser, NSEventUpdate, NSRegistration, NSResult } from '../ns-types';
import {
  ArrowLeft, MapPin, Calendar, Users, Trophy, Clock, Globe,
  CheckCircle, AlertCircle, Pin, Bell, ExternalLink, Award, Share2, Building
} from 'lucide-react';
import { useToast } from './ToastContext';

const API = 'http://localhost:5001/api2';

interface Props {
  eventId: string;
  token: string;
  currentUser: NSUser;
  onBack: () => void;
  onRefreshRegs: () => void;
}

const EVENT_IMAGES: Record<string, string> = {
  Technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  Hackathon: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
  Symposium: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  Robotics: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  Cultural: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
};

export function NSEventDetailPage({ eventId, token, currentUser, onBack, onRefreshRegs }: Props) {
  const { success, error: toastError } = useToast();
  const [event, setEvent] = useState<NSEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [myReg, setMyReg] = useState<NSRegistration | null>(null);
  const [regLoading, setRegLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [showRegForm, setShowRegForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'updates' | 'rubric' | 'results'>('overview');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const loadEvent = async () => {
    try {
      const r = await fetch(`${API}/events/${eventId}`);
      const d = await r.json();
      setEvent(d);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const loadMyReg = async () => {
    if (!token || currentUser.role !== 'student') return;
    try {
      const r = await fetch(`${API}/my/registrations`, { headers });
      const d = await r.json();
      const found = Array.isArray(d) ? d.find((reg: any) => reg.event_id === eventId) : null;
      setMyReg(found || null);
    } catch {}
  };

  useEffect(() => {
    loadEvent();
    loadMyReg();
  }, [eventId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      const r = await fetch(`${API}/events/${eventId}/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          team_name: teamName,
          project_title: projectTitle,
          project_description: projectDesc,
        }),
      });
      const d = await r.json();
      if (r.ok) {
        success('Successfully Registered! 🚀', `You are confirmed for ${event?.title}`);
        loadMyReg();
        loadEvent();
        onRefreshRegs();
        setShowRegForm(false);
      } else {
        toastError(d.error || 'Registration failed');
      }
    } catch {
      toastError('Network error registering for event');
    }
    setRegLoading(false);
  };

  if (loading || !event) {
    return (
      <div style={{ maxWidth: 900, margin: '40px auto', textAlign: 'center', color: '#64748b' }}>
        Loading competition brief...
      </div>
    );
  }

  const titleLower = event.title.toLowerCase();
  let heroImg = event.image_url || EVENT_IMAGES[event.category] || EVENT_IMAGES.Technical;
  if (!event.image_url) {
    if (titleLower.includes('hackathon')) heroImg = EVENT_IMAGES.Hackathon;
    else if (titleLower.includes('robo')) heroImg = EVENT_IMAGES.Robotics;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#2563eb',
          fontSize: '0.88rem',
          fontWeight: 700,
          cursor: 'pointer',
          width: 'fit-content',
        }}
      >
        <ArrowLeft size={16} /> Back to all competitions
      </button>

      {/* Real Photo Banner Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ height: 260, position: 'relative', overflow: 'hidden' }}>
          <img
            src={heroImg}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(15,23,42,0.85) 100%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 28,
              right: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              color: '#ffffff',
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: 999, background: '#2563eb' }}>
                {event.event_type}
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                {event.category}
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {event.title}
            </h1>
            <div style={{ fontSize: '0.88rem', opacity: 0.9, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <span>🏛️ {event.college_name}</span>
              <span>📍 {event.venue} ({event.mode})</span>
              <span>📅 {new Date(event.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Clean Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }} className="event-detail-grid">
        {/* Left: Tabbed details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Navigation Tab pills */}
          <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
            {[
              { key: 'overview', label: 'Overview & Guidelines' },
              { key: 'updates', label: `Announcements (${event.updates?.length || 0})` },
              { key: 'rubric', label: 'Jury Criteria' },
              { key: 'results', label: 'Leaderboard' },
            ].map(t => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#2563eb' : '#64748b',
                    border: 'none',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                About the Competition
              </h3>
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 24px' }}>
                {event.description || 'Join students from premier institutions across the state for this challenge.'}
              </p>

              {event.rules && (
                <>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                    Official Rules & Eligibility
                  </h3>
                  <div style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {event.rules}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 2: Updates */}
          {activeTab === 'updates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(!event.updates || event.updates.length === 0) ? (
                <div style={{ background: '#ffffff', padding: 36, borderRadius: 16, textAlign: 'center', color: '#64748b' }}>
                  No live announcements posted yet.
                </div>
              ) : (
                event.updates.map(u => (
                  <div key={u.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{u.title}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>{u.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Rubric */}
          {activeTab === 'rubric' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
                Jury Scoring Rubric
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array.isArray(event.scoring_criteria) && event.scoring_criteria.map((c: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{c.criterion}</div>
                      {c.description && <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{c.description}</div>}
                    </div>
                    <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '1rem' }}>{c.max_points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Results */}
          {activeTab === 'results' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
                Official Ranks & Leaderboard
              </h3>
              {(!event.results || event.results.length === 0) ? (
                <div style={{ textAlign: 'center', color: '#64748b', padding: 20 }}>Results pending evaluation.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {event.results.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706' }}>🏆 {r.position}</span>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{r.student_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{r.college_name}</div>
                      </div>
                      {r.avg_score != null && (
                        <span style={{ fontWeight: 800, color: '#16a34a', fontSize: '1rem' }}>{Math.round(r.avg_score)} pts</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Registration Sticky Card */}
        <div>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 18,
              padding: 24,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              position: 'sticky',
              top: 80,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {event.prize_pool && (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 18px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                  Prizes & Awards
                </span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{event.prize_pool}</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Registered:</span>
                <strong>{event.registration_count || 0} / {event.max_participants}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Team Format:</span>
                <strong>{event.team_size_min} - {event.team_size_max} Members</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Deadline:</span>
                <strong>{new Date(event.registration_deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong>
              </div>
            </div>

            {myReg ? (
              <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <CheckCircle size={20} color="#15803d" style={{ margin: '0 auto 4px', display: 'block' }} />
                <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.9rem' }}>You Are Registered</div>
                <div style={{ fontSize: '0.76rem', color: '#166534' }}>Status: {myReg.status}</div>
              </div>
            ) : currentUser.role === 'student' ? (
              showRegForm ? (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {event.team_size_max > 1 && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: 4 }}>Team Name</label>
                      <input
                        value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        placeholder="e.g. CodeForge"
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                      />
                    </div>
                  )}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', marginBottom: 4 }}>Project Title</label>
                    <input
                      value={projectTitle}
                      onChange={e => setProjectTitle(e.target.value)}
                      placeholder="e.g. Smart Traffic AI"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button type="button" onClick={() => setShowRegForm(false)} className="btn-unstop-secondary" style={{ flex: 1 }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={regLoading} className="btn-unstop-primary" style={{ flex: 1.5 }}>
                      {regLoading ? 'Saving...' : 'Confirm'}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowRegForm(true)}
                  className="btn-unstop-primary"
                  style={{ width: '100%', padding: '12px 20px', fontSize: '0.95rem' }}
                >
                  Register for Competition ⚡
                </button>
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
