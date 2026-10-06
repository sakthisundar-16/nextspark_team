import React, { useState, useEffect } from 'react';
import { User, EventItem, Participation, CertificateItem, AnalyticsOverview } from './types';
import { LandingPage } from './components/LandingPage';
import { PublicCertificateVerification } from './components/PublicCertificateVerification';
import { CertificateTemplateRenderer } from './components/CertificateTemplateRenderer';
import { AddActivityModal } from './components/AddActivityModal';
import { VerificationWorkspace } from './components/VerificationWorkspace';
import { ImpactCenter } from './components/ImpactCenter';
import { ReportCenter } from './components/ReportCenter';
import {
  LayoutDashboard, Award, CheckCircle2, FileText, BarChart3,
  Users, Building, LogOut, Plus, Search, ShieldCheck, QrCode,
  Sparkles, Bell, ArrowRight, Play, ExternalLink
} from 'lucide-react';

export function App() {
  // Navigation & View States
  const [currentView, setCurrentView] = useState<'landing' | 'app' | 'verify'>('landing');
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'verification' | 'certificates' | 'impact' | 'reports' | 'audit'>('overview');
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [demoUsers, setDemoUsers] = useState<User[]>([]);

  // Data states
  const [activities, setActivities] = useState<Participation[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  
  // Modals & previews
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewCert, setPreviewCert] = useState<any | null>(null);
  const [publicVerifyId, setPublicVerifyId] = useState<string>('EXN-2026-CSE-000184');

  // Initial load: Fetch demo users
  useEffect(() => {
    fetch('http://localhost:5000/api/auth/demo-users')
      .then(res => res.json())
      .then(data => setDemoUsers(data))
      .catch(err => console.error(err));
  }, []);

  // Fetch data when user is active
  const refreshAppData = async (currentToken: string) => {
    if (!currentToken) return;

    try {
      const headers = { Authorization: `Bearer ${currentToken}` };

      // 1. Participations
      const actRes = await fetch('http://localhost:5000/api/participations', { headers });
      const actData = await actRes.json();
      setActivities(Array.isArray(actData) ? actData : []);

      // 2. Pending verifications
      const verRes = await fetch('http://localhost:5000/api/verifications/pending', { headers });
      const verData = await verRes.json();
      setPendingVerifications(Array.isArray(verData) ? verData : []);

      // 3. Certificates
      const certRes = await fetch('http://localhost:5000/api/certificates', { headers });
      const certData = await certRes.json();
      setCertificates(Array.isArray(certData) ? certData : []);

      // 4. Analytics
      const anaRes = await fetch('http://localhost:5000/api/analytics/overview', { headers });
      const anaData = await anaRes.json();
      setAnalytics(anaData);

      // 5. Notifications
      const notRes = await fetch('http://localhost:5000/api/notifications', { headers });
      const notData = await notRes.json();
      setNotifications(Array.isArray(notData) ? notData : []);

      // 6. Live Feed
      const feedRes = await fetch('http://localhost:5000/api/analytics/live-feed');
      const feedData = await feedRes.json();
      setLiveFeed(Array.isArray(feedData) ? feedData : []);
    } catch (err) {
      console.error('Data refresh error:', err);
    }
  };

  useEffect(() => {
    if (token) {
      refreshAppData(token);
    }
  }, [token]);

  // Demo user fast-login
  const handleLoginAs = async (email: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'externiq123' })
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
        setCurrentUser(data.user);
        setCurrentView('app');
        setActiveTab('overview');
      }
    } catch (err) {
      console.error(err);
      alert('Login error');
    }
  };

  // Automated 9-Step Judge Demo Tour
  const runJudgeDemoWorkflow = async () => {
    // 1. Log in as student
    await handleLoginAs('student@externiq.edu');
    setActiveTab('activities');
    setShowAddModal(true);
  };

  if (currentView === 'landing') {
    return (
      <LandingPage
        onLogin={() => {
          if (demoUsers.length > 0) {
            handleLoginAs(demoUsers[0].email);
          } else {
            handleLoginAs('student@externiq.edu');
          }
        }}
        onVerify={() => {
          setPublicVerifyId('EXN-2026-CSE-000184');
          setCurrentView('verify');
        }}
      />
    );
  }

  if (currentView === 'verify') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setCurrentView('landing')}>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' }}>EXTERNIQ</span>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>• Verification Portal</span>
          </div>
          <button
            onClick={() => setCurrentView('landing')}
            style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
          >
            ← Return to Home
          </button>
        </div>
        <PublicCertificateVerification initialCertId={publicVerifyId} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* DESKTOP SIDEBAR */}
      <aside
        className="desktop-sidebar"
        style={{
          width: '260px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid #1e293b'
        }}
      >
        <div>
          {/* Brand header */}
          <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
              E
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em' }}>EXTERNIQ</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Intelligence Core</div>
            </div>
          </div>

          {/* Nav Items */}
          <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                width: '100%',
                color: activeTab === 'overview' ? '#ffffff' : '#94a3b8',
                backgroundColor: activeTab === 'overview' ? '#2563eb' : 'transparent',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <LayoutDashboard size={18} /> Overview
            </button>

            <button
              onClick={() => setActiveTab('activities')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                width: '100%',
                color: activeTab === 'activities' ? '#ffffff' : '#94a3b8',
                backgroundColor: activeTab === 'activities' ? '#2563eb' : 'transparent',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <Award size={18} /> {currentUser?.role === 'student' ? 'My Activities' : 'All Activities'}
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                width: '100%',
                color: activeTab === 'verification' ? '#ffffff' : '#94a3b8',
                backgroundColor: activeTab === 'verification' ? '#2563eb' : 'transparent',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={18} /> Verification
              </div>
              {pendingVerifications.length > 0 && (
                <span style={{ background: '#f59e0b', color: '#000', fontSize: '0.72rem', fontWeight: 800, padding: '2px 6px', borderRadius: '999px' }}>
                  {pendingVerifications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('certificates')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                width: '100%',
                color: activeTab === 'certificates' ? '#ffffff' : '#94a3b8',
                backgroundColor: activeTab === 'certificates' ? '#2563eb' : 'transparent',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <QrCode size={18} /> E-Certificates
            </button>

            <button
              onClick={() => setActiveTab('impact')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                width: '100%',
                color: activeTab === 'impact' ? '#ffffff' : '#94a3b8',
                backgroundColor: activeTab === 'impact' ? '#2563eb' : 'transparent',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <BarChart3 size={18} /> Impact Center
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                width: '100%',
                color: activeTab === 'reports' ? '#ffffff' : '#94a3b8',
                backgroundColor: activeTab === 'reports' ? '#2563eb' : 'transparent',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <FileText size={18} /> Report Center
            </button>
          </nav>
        </div>

        {/* Demo Fast Account Switcher in Sidebar footer */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>
            Switch Role (Judge Demo)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['student', 'verifier', 'hod', 'admin'].map((role) => {
              const matched = demoUsers.find(u => u.role === role);
              return (
                <button
                  key={role}
                  onClick={() => matched && handleLoginAs(matched.email)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backgroundColor: currentUser?.role === role ? '#38bdf8' : '#1e293b',
                    color: currentUser?.role === role ? '#0f172a' : '#cbd5e1'
                  }}
                >
                  {role}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name}
            </div>
            <button
              onClick={() => setCurrentView('landing')}
              style={{ color: '#94a3b8', padding: '4px' }}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {/* Top Header Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 50
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {activeTab === 'overview' && (currentUser?.role === 'student' ? `Hey, ${currentUser?.name.split(' ')[0]}! 👋` : 'Institutional Command Center')}
              {activeTab === 'activities' && 'External Event Activities & Engagements'}
              {activeTab === 'verification' && 'Faculty Verification Workspace'}
              {activeTab === 'certificates' && 'Verifiable E-Certificate Studio'}
              {activeTab === 'impact' && 'Accredited Impact Intelligence & Copilot'}
              {activeTab === 'reports' && 'Institutional Compliance Reports'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Judge Demo Quick Action */}
            <button
              onClick={runJudgeDemoWorkflow}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              <Play size={14} /> Start Judge Demo
            </button>

            {/* Add Activity CTA */}
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
              }}
            >
              <Plus size={16} /> Add Activity
            </button>

            {/* Public verify quick link */}
            <button
              onClick={() => setCurrentView('verify')}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                color: '#475569'
              }}
              title="Open Public QR Portal"
            >
              <QrCode size={18} />
            </button>
          </div>
        </header>

        {/* Viewport content */}
        <div style={{ padding: '28px', maxWidth: '1360px', width: '100%', margin: '0 auto' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Student Hero Banner if role == student */}
              {currentUser?.role === 'student' && (
                <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', borderRadius: '18px', padding: '32px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 6px 0' }}>
                      Hey, {currentUser.name.split(' ')[0]}! 👋
                    </h1>
                    <p style={{ opacity: 0.9, fontSize: '0.95rem', margin: 0 }}>
                      Your external activities and hackathon wins are actively building your accredited institutional record.
                    </p>
                    <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} /> +18% activity growth over last semester
                    </div>
                  </div>

                  {/* Student Score Badge */}
                  <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px 28px', borderRadius: '14px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>
                      Personal Impact Score
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'monospace' }}>
                      88 <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>/ 100</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                      Transparent formula (Rigor, Level, Wins)
                    </div>
                  </div>
                </div>
              )}

              {/* Top KPIs */}
              {analytics && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Activities</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{analytics.kpis.totalActivities}</div>
                  </div>
                  <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Verified & Accredited</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>{analytics.kpis.verifiedActivities}</div>
                  </div>
                  <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Achievements</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706' }}>{analytics.kpis.achievementsCount}</div>
                  </div>
                  <div style={{ background: '#ffffff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Pending Verification</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#9333ea' }}>{analytics.kpis.pendingVerification}</div>
                  </div>
                </div>
              )}

              {/* LIVE IMPACT FEED WOW FEATURE */}
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Live External Impact Feed</h3>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Real-time institutional stream</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {liveFeed.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                          {item.department_code || 'INST'}
                        </span>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{item.participant_name}</strong>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}> — {item.event_name}</span>
                        </div>
                      </div>
                      <span style={{ background: item.status === 'VERIFIED' ? '#ecfdf5' : '#fef3c7', color: item.status === 'VERIFIED' ? '#047857' : '#b45309', padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {item.result_type} ({item.status})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Recorded External Engagements ({activities.length})
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{ padding: '8px 16px', background: '#2563eb', color: '#ffffff', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  + Submit New Activity
                </button>
              </div>

              {activities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
                  No activities submitted yet. Click "+ Submit New Activity" to begin!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {act.event_level} • {act.event_category}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {act.event_date}
                          </span>
                        </div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                          {act.event_name}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                          Participant: <strong>{act.participant_name}</strong> ({act.department_code}) • Role: {act.role_title || act.participation_type}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, background: act.status === 'VERIFIED' ? '#dcfce7' : '#fef3c7', color: act.status === 'VERIFIED' ? '#15803d' : '#b45309' }}>
                            {act.status}
                          </span>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', marginTop: '2px' }}>
                            {act.result_type}
                          </div>
                        </div>

                        {act.certificate_id && (
                          <button
                            onClick={() => {
                              const found = certificates.find(c => c.id === act.certificate_id);
                              if (found) setPreviewCert(found);
                            }}
                            style={{ padding: '6px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, border: '1px solid #bfdbfe' }}
                          >
                            View Certificate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VERIFICATION WORKSPACE */}
          {activeTab === 'verification' && (
            <VerificationWorkspace
              pendingList={pendingVerifications}
              token={token}
              onActionComplete={() => refreshAppData(token)}
            />
          )}

          {/* TAB 4: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                  Institutional E-Certificates Registry ({certificates.length})
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      style={{
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.82rem', color: '#2563eb' }}>
                            {cert.id}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: cert.status === 'VALID' ? '#dcfce7' : '#fee2e2', color: cert.status === 'VALID' ? '#15803d' : '#b91c1c' }}>
                            {cert.status}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                          {cert.issued_to_name}
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>
                          {cert.event_name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#d97706', fontWeight: 700 }}>
                          {cert.achievement} • {cert.department_name}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                        <button
                          onClick={() => setPreviewCert(cert)}
                          style={{ flex: 1, padding: '6px 12px', background: '#2563eb', color: '#ffffff', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem' }}
                        >
                          Preview & Print
                        </button>
                        <button
                          onClick={() => {
                            setPublicVerifyId(cert.id);
                            setCurrentView('verify');
                          }}
                          style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '6px', fontWeight: 600, fontSize: '0.82rem' }}
                        >
                          Verify QR
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: IMPACT CENTER */}
          {activeTab === 'impact' && (
            <ImpactCenter analytics={analytics} token={token} />
          )}

          {/* TAB 6: REPORT CENTER */}
          {activeTab === 'reports' && (
            <ReportCenter token={token} />
          )}
        </div>
      </main>

      {/* ADD ACTIVITY MODAL */}
      {showAddModal && (
        <AddActivityModal
          token={token}
          onSuccess={() => {
            setShowAddModal(false);
            refreshAppData(token);
          }}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {/* CERTIFICATE PREVIEW MODAL */}
      {previewCert && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '94vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button
                onClick={() => setPreviewCert(null)}
                style={{ fontSize: '1.2rem', fontWeight: 700, color: '#64748b' }}
              >
                ✕ Close
              </button>
            </div>
            <CertificateTemplateRenderer
              cert={previewCert}
              onDownload={() => window.print()}
              onVerify={() => {
                setPublicVerifyId(previewCert.id);
                setPreviewCert(null);
                setCurrentView('verify');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
