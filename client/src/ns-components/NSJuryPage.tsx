import React, { useState, useEffect } from 'react';
import { NSUser } from '../ns-types';
import {
  CheckCircle, Clock, AlertCircle, Star, Sparkles, Sliders,
  Send, ExternalLink, ArrowRight, ShieldCheck, Check
} from 'lucide-react';
import { useToast } from './ToastContext';

const API = 'http://localhost:5001/api2';

interface Props {
  token: string;
  currentUser: NSUser;
}

export function NSJuryPage({ token, currentUser }: Props) {
  const { success, error: toastError } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [scoringParticipant, setScoringParticipant] = useState<any | null>(null);
  const [criteriaScores, setCriteriaScores] = useState<any[]>([]);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch(`${API}/jury/events`, { headers })
      .then(r => r.json())
      .then(d => {
        const evts = Array.isArray(d) ? d : [];
        setEvents(evts);
        if (evts.length > 0) setSelectedEvent(evts[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadParticipants = async (eventId: string) => {
    try {
      const r = await fetch(`${API}/jury/events/${eventId}/participants`, { headers });
      const d = await r.json();
      setParticipants(Array.isArray(d) ? d : []);
    } catch {}
  };

  useEffect(() => {
    if (selectedEvent) {
      loadParticipants(selectedEvent.id);
      setScoringParticipant(null);
    }
  }, [selectedEvent]);

  const startScoring = (participant: any) => {
    setScoringParticipant(participant);
    setRemarks(participant.remarks || '');

    let criteria: any[] = [];
    try {
      criteria =
        typeof selectedEvent.scoring_criteria === 'string'
          ? JSON.parse(selectedEvent.scoring_criteria)
          : selectedEvent.scoring_criteria || [];
    } catch {}

    if (participant.is_scored_by_me && participant.criteria_scores) {
      try {
        const existing =
          typeof participant.criteria_scores === 'string'
            ? JSON.parse(participant.criteria_scores)
            : participant.criteria_scores;
        setCriteriaScores(
          criteria.map(c => {
            const found = existing.find((e: any) => e.criterion === c.criterion);
            return {
              criterion: c.criterion,
              max_points: c.max_points,
              score: found ? found.score : Math.round(c.max_points * 0.75),
              description: c.description,
            };
          })
        );
        return;
      } catch {}
    }

    setCriteriaScores(
      criteria.map(c => ({
        criterion: c.criterion,
        max_points: c.max_points,
        score: Math.round(c.max_points * 0.75),
        description: c.description,
      }))
    );
  };

  const handleScoreChange = (idx: number, newScore: number) => {
    const updated = [...criteriaScores];
    const max = updated[idx].max_points || 25;
    updated[idx].score = Math.max(0, Math.min(max, newScore));
    setCriteriaScores(updated);
  };

  const totalScore = criteriaScores.reduce((acc, c) => acc + (Number(c.score) || 0), 0);
  const maxScore = criteriaScores.reduce((acc, c) => acc + (Number(c.max_points) || 0), 0);

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringParticipant || !selectedEvent) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/jury/score`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event_id: selectedEvent.id,
          registration_id: scoringParticipant.registration_id,
          criteria_scores: criteriaScores,
          remarks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        success('Evaluation Submitted', `Recorded score of ${data.total_score}/${data.max_possible} for ${scoringParticipant.student_name}`);
        loadParticipants(selectedEvent.id);
        setScoringParticipant(null);
      } else {
        toastError(data.error || 'Failed to submit score');
      }
    } catch {
      toastError('Network error submitting score');
    }
    setSubmitting(false);
  };

  const pendingCount = participants.filter(p => !p.is_scored_by_me).length;

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Precision Evaluation Workspace Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.3) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 20,
          padding: '24px 30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              borderRadius: 999,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6ee7b7',
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            <ShieldCheck size={14} /> Precision Evaluation Workspace
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Good afternoon, Judge {currentUser.name.split(' ')[0]}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
            {pendingCount === 0
              ? 'All assigned submissions evaluated. Thank you for your precision.'
              : `${pendingCount} evaluation${pendingCount > 1 ? 's' : ''} currently awaiting your review.`}
          </p>
        </div>

        {selectedEvent && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '12px 18px',
              borderRadius: 14,
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Active Event</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#6ee7b7' }}>{selectedEvent.title}</div>
          </div>
        )}
      </div>

      {/* Event Select Tabs */}
      {events.length > 1 && (
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
          {events.map(ev => {
            const isSelected = selectedEvent?.id === ev.id;
            return (
              <button
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  fontSize: '0.84rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(22, 30, 49, 0.7)',
                  border: isSelected ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#fff' : '#94a3b8',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {ev.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Workspace Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: scoringParticipant ? '1fr 1.25fr' : '1fr', gap: 24 }}>
        {/* LEFT / LIST: Participants Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              Assigned Participant Queue ({participants.length})
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              {participants.filter(p => p.is_scored_by_me).length} evaluated
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {participants.map(p => {
              const isSelected = scoringParticipant?.registration_id === p.registration_id;
              const isScored = p.is_scored_by_me;
              return (
                <div
                  key={p.registration_id}
                  onClick={() => startScoring(p)}
                  style={{
                    background: isSelected
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(22, 30, 49, 0.7)',
                    border: isSelected
                      ? '1px solid rgba(16, 185, 129, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 14,
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.94rem' }}>{p.student_name}</span>
                      {p.team_name && (
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                          {p.team_name}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      {p.college_name || 'Autonomous Institution'} {p.project_title ? `· 💡 ${p.project_title}` : ''}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    {isScored ? (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Check size={12} /> {Math.round(p.total_score || 0)} pts
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: 999,
                          background: 'rgba(245, 158, 11, 0.12)',
                          color: '#fbbf24',
                        }}
                      >
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Focused Scoring Pad */}
        {scoringParticipant && (
          <div
            style={{
              background: 'rgba(22, 30, 49, 0.85)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 20,
              padding: '24px 28px',
              position: 'sticky',
              top: 90,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Evaluating Candidate
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: '2px 0 2px' }}>
                  {scoringParticipant.student_name}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
                  {scoringParticipant.project_title || scoringParticipant.team_name || scoringParticipant.college_name}
                </p>
              </div>

              {/* Total Score Meter */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  padding: '10px 18px',
                  borderRadius: 14,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#6ee7b7', lineHeight: 1 }}>
                  {totalScore}
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/{maxScore}</span>
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#a7f3d0', textTransform: 'uppercase', marginTop: 2 }}>
                  Total Points
                </div>
              </div>
            </div>

            {/* Rubric Sliders Form */}
            <form onSubmit={handleSubmitScore} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {criteriaScores.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '14px 16px',
                      borderRadius: 12,
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>{c.criterion}</span>
                      <span style={{ fontWeight: 800, color: '#34d399', fontSize: '0.95rem' }}>
                        {c.score} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>/ {c.max_points}</span>
                      </span>
                    </div>
                    {c.description && (
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 10px' }}>{c.description}</p>
                    )}
                    <input
                      type="range"
                      min={0}
                      max={c.max_points}
                      value={c.score}
                      onChange={e => handleScoreChange(idx, Number(e.target.value))}
                      style={{
                        width: '100%',
                        accentColor: '#10b981',
                        cursor: 'pointer',
                      }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>
                  Judge Notes & Qualitative Remarks
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Feedback on presentation, depth, architecture, or areas for improvement..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    background: '#161e31',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setScoringParticipant(null)}
                  className="btn-brand-secondary"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-brand-primary"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Save & Lock Score'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
