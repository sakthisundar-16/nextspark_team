import React, { useState, useEffect } from 'react';
import { NSUser, NSEvent, NSEventUpdate, NSRegistration } from '../ns-types';
import {
  Radio, Plus, Send, Users, Trophy, CheckCircle, AlertCircle, Clock,
  Play, CheckCircle2, Award, ArrowRight, Sparkles, Sliders, Palette,
  ExternalLink, ChevronRight, RefreshCw, Star, ShieldCheck, Flame
} from 'lucide-react';
import { useToast } from './ToastContext';

const API = 'http://localhost:5001/api2';

interface Props {
  token: string;
  currentUser: NSUser;
  onOpenEvent: (id: string) => void;
  onCreateEvent: () => void;
}

interface CertDesignConfig {
  theme: 'gold' | 'cyber' | 'royal' | 'minimal';
  certificateTitle: string;
  orgSubtitle: string;
  issuedBy: string;
  borderColor: string;
}

export function NSCommitteeHeadPage({ token, currentUser, onOpenEvent, onCreateEvent }: Props) {
  const { success, error: toastError } = useToast();
  const [events, setEvents] = useState<NSEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<NSEvent | null>(null);
  const [activePanel, setActivePanel] = useState<'scoring' | 'status' | 'template' | 'updates'>('scoring');
  
  // Registrations & scoring state
  const [registrations, setRegistrations] = useState<NSRegistration[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(85);
  const [remarksInput, setRemarksInput] = useState<string>('');
  const [positionInput, setPositionInput] = useState<'Winner' | 'Runner-Up' | '2nd Runner-Up' | 'Participant'>('Participant');
  const [savingScore, setSavingScore] = useState(false);

  // Status transition state
  const [statusChanging, setStatusChanging] = useState(false);

  // Announcements state
  const [updates, setUpdates] = useState<NSEventUpdate[]>([]);
  const [updTitle, setUpdTitle] = useState('');
  const [updContent, setUpdContent] = useState('');
  const [updType, setUpdType] = useState('Info');
  const [updPinned, setUpdPinned] = useState(false);
  const [updLoading, setUpdLoading] = useState(false);

  // Certificate template designer state
  const [certDesign, setCertDesign] = useState<CertDesignConfig>({
    theme: 'gold',
    certificateTitle: 'Certificate of Merit & Achievement',
    orgSubtitle: 'Centralized Inter-College Engineering Consortium',
    issuedBy: currentUser.name || 'Event Operations Head',
    borderColor: '#d97706',
  });
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Publishing results & auto-cert state
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/events`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      let evts = Array.isArray(d) ? d : [];
      // STRICT FILTER: Only show events created by current coordinator
      if (currentUser.role === 'committee_head') {
        evts = evts.filter((e: NSEvent) => e.created_by === currentUser.id);
      }
      setEvents(evts);
      if (evts.length > 0) {
        // preserve selected if exists, else first
        setSelectedEvent(prev => (prev ? evts.find(e => e.id === prev.id) || evts[0] : evts[0]));
      }
    } catch {
      toastError('Could not load events');
    }
    setLoading(false);
  };

  const loadRegistrationsAndUpdates = async (eventId: string) => {
    setLoadingRegs(true);
    try {
      const [regsRes, updRes] = await Promise.all([
        fetch(`${API}/events/${eventId}/registrations`, { headers }),
        fetch(`${API}/events/${eventId}/updates`),
      ]);
      const regsData = await regsRes.json();
      const updData = await updRes.json();
      setRegistrations(Array.isArray(regsData) ? regsData : []);
      setUpdates(Array.isArray(updData) ? updData : []);
    } catch {
      toastError('Could not load event data');
    }
    setLoadingRegs(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadRegistrationsAndUpdates(selectedEvent.id);
      // parse existing certificate template if configured
      if (selectedEvent.certificate_template) {
        try {
          const parsed = JSON.parse(selectedEvent.certificate_template);
          setCertDesign(prev => ({ ...prev, ...parsed }));
        } catch {}
      }
    }
  }, [selectedEvent?.id]);

  // Handle Event Status Transition (Open -> Ongoing -> Completed)
  const handleUpdateStatus = async (newStatus: 'Open' | 'Ongoing' | 'Completed') => {
    if (!selectedEvent) return;
    setStatusChanging(true);
    try {
      const res = await fetch(`${API}/events/${selectedEvent.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        success('Status Updated', `Event marked as "${newStatus}"!`);
        setSelectedEvent({ ...selectedEvent, status: newStatus });
        loadEvents();

        // If completed, trigger automated certificate generation if scores exist
        if (newStatus === 'Completed') {
          handlePublishResults(true);
        }
      } else {
        toastError(data.error || 'Failed to update event state');
      }
    } catch {
      toastError('Network error updating status');
    }
    setStatusChanging(false);
  };

  // Handle Direct Scoring by Committee Head
  const handleSaveScore = async (regId: string) => {
    if (!selectedEvent) return;
    setSavingScore(true);
    try {
      const res = await fetch(`${API}/events/${selectedEvent.id}/update-score`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          registration_id: regId,
          score: scoreInput,
          max_score: 100,
          remarks: remarksInput,
          position: positionInput,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        success('Evaluation Recorded', `Awarded ${scoreInput}/100 [${positionInput}]`);
        setEditingScoreId(null);
        loadRegistrationsAndUpdates(selectedEvent.id);
      } else {
        toastError(data.error || 'Failed to submit score');
      }
    } catch {
      toastError('Error saving evaluation');
    }
    setSavingScore(false);
  };

  // Save Customized Certificate Design Template
  const handleSaveCertTemplate = async () => {
    if (!selectedEvent) return;
    setSavingTemplate(true);
    try {
      const res = await fetch(`${API}/events/${selectedEvent.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          certificate_template: JSON.stringify(certDesign),
        }),
      });
      if (res.ok) {
        success('Certificate Template Saved', 'All future certificates for this event will inherit this custom styling.');
        setSelectedEvent({ ...selectedEvent, certificate_template: JSON.stringify(certDesign) });
      } else {
        toastError('Failed to save certificate template');
      }
    } catch {
      toastError('Network error');
    }
    setSavingTemplate(false);
  };

  // Publish Results & Automatically Issue E-Certificates
  const handlePublishResults = async (autoTriggered = false) => {
    if (!selectedEvent) return;
    setPublishing(true);
    try {
      const res = await fetch(`${API}/events/${selectedEvent.id}/publish-results`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        success(
          autoTriggered ? '🎉 Event Completed & Certificates Generated!' : 'Results & Certificates Published',
          `${data.certificates_issued || data.total_ranked} digital credentials generated with custom styling!`
        );
        setPublishResult(data);
        loadEvents();
        loadRegistrationsAndUpdates(selectedEvent.id);
      } else {
        if (!autoTriggered) {
          toastError(data.error || 'Please evaluate at least one team before finalizing results.');
        }
      }
    } catch {
      if (!autoTriggered) toastError('Error calculating results');
    }
    setPublishing(false);
  };

  // Post Announcement
  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !updTitle || !updContent) return;
    setUpdLoading(true);
    try {
      const res = await fetch(`${API}/events/${selectedEvent.id}/updates`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: updTitle,
          content: updContent,
          update_type: updType,
          is_pinned: updPinned ? 1 : 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        success('Announcement Broadcasted', 'Students receive instant live notification.');
        setUpdates(prev => [data, ...prev]);
        setUpdTitle('');
        setUpdContent('');
      } else {
        toastError(data.error || 'Failed to post update');
      }
    } catch {
      toastError('Error broadcasting');
    }
    setUpdLoading(false);
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── TOP OPERATIONAL HEADER ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: '#eff6ff', color: '#2563eb', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
            <Radio size={14} className="animate-pulse" /> Event Operations Center
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {selectedEvent?.title || 'Event Management Workspace'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Lead coordinator controls: Score registered teams, manage lifecycle, broadcast notices, and customize e-certificates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onCreateEvent} className="btn-brand-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Host New Event
          </button>
        </div>
      </div>

      {/* ── OWNED EVENTS SELECTOR STRIP ── */}
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
          📁 Your Hosted Competitions ({events.length})
        </div>
        {events.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 14, padding: 36, textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 12px' }}>
              You haven't posted any competitions yet. Create an event to begin managing registrations and issuing certificates.
            </p>
            <button onClick={onCreateEvent} className="btn-brand-primary">
              <Plus size={16} /> Host Your First Event
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
            {events.map(ev => {
              const isSelected = selectedEvent?.id === ev.id;
              const statusColor = ev.status === 'Open' ? '#10b981' : ev.status === 'Ongoing' ? '#f59e0b' : '#64748b';
              return (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  style={{
                    flexShrink: 0,
                    padding: '12px 18px',
                    borderRadius: 12,
                    background: isSelected ? '#1e293b' : '#ffffff',
                    border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                    color: isSelected ? '#ffffff' : '#334155',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: isSelected ? '0 4px 12px rgba(15,23,42,0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor }} />
                  <span>{ev.title}</span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 6,
                      background: isSelected ? 'rgba(255,255,255,0.18)' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#64748b',
                    }}
                  >
                    {ev.status}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedEvent && (
        <>
          {/* ── EVENT LIFECYCLE CONTROLS BAR ── */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Current Lifecycle Stage:
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 12px',
                  borderRadius: 8,
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  background:
                    selectedEvent.status === 'Open'
                      ? '#ecfdf5'
                      : selectedEvent.status === 'Ongoing'
                      ? '#fffbeb'
                      : '#f1f5f9',
                  color:
                    selectedEvent.status === 'Open'
                      ? '#059669'
                      : selectedEvent.status === 'Ongoing'
                      ? '#d97706'
                      : '#475569',
                }}
              >
                {selectedEvent.status === 'Ongoing' && <Flame size={14} className="animate-pulse" />}
                {selectedEvent.status.toUpperCase()}
              </span>
            </div>

            {/* Stage Transition Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {selectedEvent.status === 'Open' && (
                <button
                  disabled={statusChanging}
                  onClick={() => handleUpdateStatus('Ongoing')}
                  style={{
                    background: '#f59e0b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Play size={15} /> Start Event (Mark as Ongoing)
                </button>
              )}

              {selectedEvent.status === 'Ongoing' && (
                <button
                  disabled={statusChanging}
                  onClick={() => handleUpdateStatus('Completed')}
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <CheckCircle2 size={15} /> Finish Event & Auto-Certify
                </button>
              )}

              {selectedEvent.status === 'Completed' && (
                <button
                  disabled={statusChanging}
                  onClick={() => handleUpdateStatus('Ongoing')}
                  style={{
                    background: '#64748b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Reopen as Ongoing
                </button>
              )}

              <button
                onClick={() => onOpenEvent(selectedEvent.id)}
                style={{
                  background: '#f1f5f9',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '8px 14px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                Public Page <ExternalLink size={14} />
              </button>
            </div>
          </div>

          {/* ── WORKSPACE TABS ── */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              background: '#f1f5f9',
              padding: 4,
              borderRadius: 12,
              width: 'fit-content',
            }}
          >
            {[
              { key: 'scoring', label: `Registered Teams & Scoring (${registrations.length})` },
              { key: 'template', label: 'Certificate Template Designer' },
              { key: 'updates', label: `Announcements Feed (${updates.length})` },
              { key: 'status', label: 'Overview & Telemetry' },
            ].map(tab => {
              const isActive = activePanel === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActivePanel(tab.key as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 800 : 600,
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#0f172a' : '#64748b',
                    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── TAB 1: REGISTERED TEAMS & DIRECT SCORING MATRIX ── */}
          {activePanel === 'scoring' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
                      Registered Teams & Direct Evaluation
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
                      As Event Operations Head, you score each student/team directly, designate ranks, and generate credentials.
                    </p>
                  </div>

                  <button
                    onClick={() => handlePublishResults(false)}
                    disabled={publishing || registrations.length === 0}
                    className="btn-brand-primary"
                    style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Trophy size={16} /> {publishing ? 'Generating...' : 'Finalize Ranks & Dispatch E-Certificates'}
                  </button>
                </div>

                {publishResult && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 10, padding: 14, marginBottom: 16, color: '#065f46', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span>
                      <strong>Certificates Dispatched:</strong> {publishResult.certificates_issued} credentials generated! Students can now download them from their profiles.
                    </span>
                  </div>
                )}

                {loadingRegs ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading registered teams...</div>
                ) : registrations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 50, background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                    <Users size={32} color="#94a3b8" style={{ marginBottom: 10 }} />
                    <div style={{ fontWeight: 700, color: '#334155', marginBottom: 4 }}>No registrations yet</div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                      Students will appear here once they register for this competition.
                    </div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          <th style={{ padding: '12px 14px' }}>Participant / Team</th>
                          <th style={{ padding: '12px 14px' }}>College & Reg</th>
                          <th style={{ padding: '12px 14px' }}>Score (0-100)</th>
                          <th style={{ padding: '12px 14px' }}>Rank / Honor</th>
                          <th style={{ padding: '12px 14px' }}>Certificate</th>
                          <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.map(reg => {
                          const isEditing = editingScoreId === reg.id;
                          return (
                            <tr key={reg.id} style={{ borderBottom: '1px solid #f1f5f9', background: isEditing ? '#f8fafc' : 'transparent' }}>
                              <td style={{ padding: '14px' }}>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{reg.student_name}</div>
                                {reg.team_name && (
                                  <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600 }}>Team: {reg.team_name}</div>
                                )}
                                {reg.project_title && (
                                  <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Project: {reg.project_title}</div>
                                )}
                              </td>

                              <td style={{ padding: '14px' }}>
                                <div style={{ color: '#334155', fontWeight: 600 }}>{reg.college_name || 'Affiliated College'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{reg.reg_number || reg.department || 'Student'}</div>
                              </td>

                              <td style={{ padding: '14px' }}>
                                {isEditing ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={scoreInput}
                                      onChange={e => setScoreInput(Number(e.target.value))}
                                      style={{ width: 64, padding: '6px 8px', borderRadius: 6, border: '1px solid #2563eb', fontWeight: 800, fontSize: '0.9rem' }}
                                    />
                                    <span style={{ color: '#64748b' }}>/ 100</span>
                                  </div>
                                ) : (
                                  <span style={{ fontWeight: 800, color: reg.total_score ? '#0f172a' : '#94a3b8', fontSize: '0.95rem' }}>
                                    {reg.total_score !== undefined && reg.total_score !== null ? `${Math.round(reg.total_score)}/100` : 'Not Scored'}
                                  </span>
                                )}
                              </td>

                              <td style={{ padding: '14px' }}>
                                {isEditing ? (
                                  <select
                                    value={positionInput}
                                    onChange={e => setPositionInput(e.target.value as any)}
                                    style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700 }}
                                  >
                                    <option value="Winner">🥇 1st - Winner</option>
                                    <option value="Runner-Up">🥈 2nd - Runner-Up</option>
                                    <option value="2nd Runner-Up">🥉 3rd - 2nd Runner-Up</option>
                                    <option value="Participant">🎓 Participant</option>
                                  </select>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 800,
                                      padding: '3px 8px',
                                      borderRadius: 6,
                                      background:
                                        reg.position === 'Winner'
                                          ? '#fef3c7'
                                          : reg.position === 'Runner-Up'
                                          ? '#f1f5f9'
                                          : '#eff6ff',
                                      color:
                                        reg.position === 'Winner'
                                          ? '#b45309'
                                          : reg.position === 'Runner-Up'
                                          ? '#475569'
                                          : '#2563eb',
                                    }}
                                  >
                                    {reg.position || 'Pending'}
                                  </span>
                                )}
                              </td>

                              <td style={{ padding: '14px' }}>
                                {reg.certificate_id ? (
                                  <a
                                    href={`${API}/certificates/download/${reg.certificate_id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      color: '#059669',
                                      fontWeight: 700,
                                      fontSize: '0.78rem',
                                      textDecoration: 'none',
                                      background: '#ecfdf5',
                                      padding: '3px 8px',
                                      borderRadius: 6,
                                    }}
                                  >
                                    <CheckCircle2 size={13} /> {reg.certificate_id}
                                  </a>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Generated on finish</span>
                                )}
                              </td>

                              <td style={{ padding: '14px', textAlign: 'right' }}>
                                {isEditing ? (
                                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                    <button
                                      disabled={savingScore}
                                      onClick={() => handleSaveScore(reg.id)}
                                      style={{
                                        background: '#2563eb',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: 6,
                                        padding: '5px 12px',
                                        fontSize: '0.78rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      {savingScore ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                      onClick={() => setEditingScoreId(null)}
                                      style={{
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        border: 'none',
                                        borderRadius: 6,
                                        padding: '5px 10px',
                                        fontSize: '0.78rem',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingScoreId(reg.id);
                                      setScoreInput(reg.total_score ? Math.round(reg.total_score) : 85);
                                      setPositionInput((reg.position as any) || 'Participant');
                                    }}
                                    style={{
                                      background: '#f8fafc',
                                      border: '1px solid #cbd5e1',
                                      borderRadius: 6,
                                      padding: '5px 12px',
                                      fontSize: '0.78rem',
                                      fontWeight: 700,
                                      color: '#2563eb',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Evaluate / Score
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 2: CERTIFICATE TEMPLATE CUSTOMIZER ── */}
          {activePanel === 'template' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              {/* Customizer Settings Controls */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px' }}>
                    Customize Certificate Design
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
                    Tailor how e-certificates appear when issued to students of this competition.
                  </p>
                </div>

                {/* Theme Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Certificate Style Theme
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { key: 'gold', label: 'Gold Classic', border: '#d97706' },
                      { key: 'cyber', label: 'Tech Cyan', border: '#06b6d4' },
                      { key: 'royal', label: 'Royal Indigo', border: '#6366f1' },
                      { key: 'minimal', label: 'Minimalist Slate', border: '#334155' },
                    ].map(t => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setCertDesign({ ...certDesign, theme: t.key as any, borderColor: t.border })}
                        style={{
                          padding: '10px 12px',
                          borderRadius: 8,
                          border: certDesign.theme === t.key ? `2px solid ${t.border}` : '1px solid #e2e8f0',
                          background: certDesign.theme === t.key ? '#f8fafc' : '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: '#0f172a',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.border }} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Certificate Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Certificate Header Title
                  </label>
                  <input
                    value={certDesign.certificateTitle}
                    onChange={e => setCertDesign({ ...certDesign, certificateTitle: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                    }}
                  />
                </div>

                {/* Organization Subtitle */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Sub-header / Organization Line
                  </label>
                  <input
                    value={certDesign.orgSubtitle}
                    onChange={e => setCertDesign({ ...certDesign, orgSubtitle: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                    }}
                  />
                </div>

                {/* Signature Authority Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Issuing Authority / Lead Coordinator
                  </label>
                  <input
                    value={certDesign.issuedBy}
                    onChange={e => setCertDesign({ ...certDesign, issuedBy: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.86rem',
                    }}
                  />
                </div>

                <button
                  onClick={handleSaveCertTemplate}
                  disabled={savingTemplate}
                  className="btn-brand-primary"
                  style={{ marginTop: 8 }}
                >
                  {savingTemplate ? 'Saving Design...' : '💾 Save Custom Certificate Template'}
                </button>
              </div>

              {/* Live Preview of Certificate */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Live Certificate Preview
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>
                    High-Res Print Ready
                  </span>
                </div>

                {/* Simulated Certificate Canvas */}
                <div
                  style={{
                    background: '#ffffff',
                    border: `8px double ${certDesign.borderColor}`,
                    borderRadius: 8,
                    padding: '24px 20px',
                    textAlign: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b' }}>
                    NextSpark Collegiate Arena
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
                    {selectedEvent.college_name || 'Hosting Institution'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 12 }}>
                    {certDesign.orgSubtitle}
                  </div>

                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: certDesign.borderColor, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '12px 0 6px' }}>
                    {certDesign.certificateTitle}
                  </div>

                  <div style={{ fontSize: '0.76rem', color: '#64748b', fontStyle: 'italic', marginBottom: 6 }}>
                    This is proudly presented in recognition of achievement to
                  </div>

                  <div style={{ fontSize: '1.4rem', fontWeight: 800, fontStyle: 'italic', color: '#0f172a', margin: '0 0 8px', textDecoration: `underline ${certDesign.borderColor}` }}>
                    Candidate Name
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4, margin: '0 auto 16px', maxWidth: 360 }}>
                    for exceptional merit and contribution as <strong style={{ color: certDesign.borderColor }}>Winner</strong> in
                    <div style={{ fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{selectedEvent.title}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 12, marginTop: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#1e293b' }}>{certDesign.issuedBy.split(' ')[0]}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f172a' }}>{certDesign.issuedBy}</div>
                      <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Event Operations Head</div>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#64748b' }}>
                      <div style={{ width: 40, height: 40, border: '1px solid #0f172a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.6rem' }}>
                        QR
                      </div>
                      <div>NSP-2026-VERIFIED</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#1e293b' }}>Academic Head</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0f172a' }}>Dean of Academics</div>
                      <div style={{ fontSize: '0.62rem', color: '#64748b' }}>Governing Board</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: ANNOUNCEMENTS BROADCAST FEED ── */}
          {activePanel === 'updates' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
              {/* Form */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 16px' }}>
                  Broadcast Live Announcement
                </h3>
                <form onSubmit={handlePostUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: 6 }}>
                      Headline *
                    </label>
                    <input
                      required
                      value={updTitle}
                      onChange={e => setUpdTitle(e.target.value)}
                      placeholder="e.g. Schedule update or Round 2 Announcement"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: 6 }}>
                        Notice Type
                      </label>
                      <select
                        value={updType}
                        onChange={e => setUpdType(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                      >
                        <option value="Info">Info Notice</option>
                        <option value="Important">Urgent / Important</option>
                        <option value="Schedule">Schedule Revision</option>
                        <option value="Result">Result Notice</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 26 }}>
                      <input
                        type="checkbox"
                        id="pinned"
                        checked={updPinned}
                        onChange={e => setUpdPinned(e.target.checked)}
                        style={{ width: 16, height: 16, cursor: 'pointer' }}
                      />
                      <label htmlFor="pinned" style={{ fontSize: '0.82rem', color: '#334155', cursor: 'pointer', fontWeight: 600 }}>
                        Pin to top
                      </label>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: 6 }}>
                      Announcement Content *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={updContent}
                      onChange={e => setUpdContent(e.target.value)}
                      placeholder="Enter room allocations, reporting deadlines, or submission links..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: '0.86rem', resize: 'vertical' }}
                    />
                  </div>

                  <button type="submit" disabled={updLoading} className="btn-brand-primary" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                    <Send size={15} /> {updLoading ? 'Broadcasting...' : 'Broadcast to Registered Students'}
                  </button>
                </form>
              </div>

              {/* Feed List */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                  Posted Announcements ({updates.length})
                </h3>
                {updates.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No announcements broadcasted yet.</p>
                ) : (
                  updates.map(u => (
                    <div key={u.id} style={{ padding: '14px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>{u.title}</span>
                        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 4, background: u.update_type === 'Important' ? '#fef2f2' : '#eff6ff', color: u.update_type === 'Important' ? '#ef4444' : '#2563eb', fontWeight: 700 }}>
                          {u.update_type}
                        </span>
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.82rem', margin: '0 0 6px' }}>{u.content}</p>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── TAB 4: TELEMETRY & STATS ── */}
          {activePanel === 'status' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {[
                { label: 'Total Enrolled', val: registrations.length, sub: `Capacity: ${selectedEvent.max_participants}`, color: '#2563eb', icon: Users },
                { label: 'Current State', val: selectedEvent.status, sub: `Mode: ${selectedEvent.mode}`, color: '#10b981', icon: Radio },
                { label: 'Prize Pool', val: selectedEvent.prize_pool || 'Honorarium', sub: `1st: ${selectedEvent.first_prize || 'Winner'}`, color: '#d97706', icon: Trophy },
                { label: 'Category', val: selectedEvent.category, sub: selectedEvent.venue, color: '#7c3aed', icon: Sparkles },
              ].map(item => (
                <div key={item.label} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>{item.label}</span>
                    <item.icon size={18} color={item.color} />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
                    {item.val}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
