import React, { useState, useEffect, useCallback } from 'react';
import { NSUser, NSEvent, NSRegistration, NSCertificate, NSNotification, NSAnalytics } from './ns-types';
import { NSLanding } from './ns-components/NSLanding';
import { NSEventsPage } from './ns-components/NSEventsPage';
import { NSEventDetailPage } from './ns-components/NSEventDetailPage';
import { NSMyEventsPage } from './ns-components/NSMyEventsPage';
import { NSCertificatesPage } from './ns-components/NSCertificatesPage';
import { NSCommitteeHeadPage } from './ns-components/NSCommitteeHeadPage';
import { NSJuryPage } from './ns-components/NSJuryPage';
import { NSAdminPage } from './ns-components/NSAdminPage';
import { NSCreateEventPage } from './ns-components/NSCreateEventPage';
import { NSNotificationsPanel } from './ns-components/NSNotificationsPanel';
import { NSVerifyPage } from './ns-components/NSVerifyPage';
import { ToastProvider, useToast } from './ns-components/ToastContext';
import { DevpostEventCard } from './ns-components/DevpostEventCard';
import {
  Zap, Calendar, Award, Users, ShieldCheck, Bell, LogOut,
  ChevronRight, Plus, Search, Trophy, Compass, Building, CheckCircle2,
  FileText, Home, ArrowRight
} from 'lucide-react';

const API = 'http://localhost:5001/api2';

type Page =
  | 'home' | 'events' | 'event-detail'
  | 'my-events' | 'certificates'
  | 'committee-head' | 'create-event'
  | 'jury' | 'admin' | 'verify';

export function NSApp() {
  return (
    <ToastProvider>
      <NSAppMain />
    </ToastProvider>
  );
}

function NSAppMain() {
  const [page, setPage] = useState<Page>('home');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<NSUser | null>(null);
  const [token, setToken] = useState<string>('');
  const [demoUsers, setDemoUsers] = useState<NSUser[]>([]);
  const [notifications, setNotifications] = useState<NSNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [analytics, setAnalytics] = useState<NSAnalytics | null>(null);
  const [myCerts, setMyCerts] = useState<NSCertificate[]>([]);
  const [myRegs, setMyRegs] = useState<NSRegistration[]>([]);
  const [verifyId, setVerifyId] = useState<string>('');

  // Demo users fetch
  useEffect(() => {
    fetch(`${API}/auth/demo-users`)
      .then(r => r.json())
      .then(setDemoUsers)
      .catch(() => {});
  }, []);

  const fetchNotifications = useCallback(async (t: string) => {
    if (!t) return;
    try {
      const r = await fetch(`${API}/notifications`, { headers: { Authorization: `Bearer ${t}` } });
      const d = await r.json();
      setNotifications(Array.isArray(d) ? d : []);
    } catch {}
  }, []);

  const fetchAnalytics = useCallback(async (t: string) => {
    if (!t) return;
    try {
      const r = await fetch(`${API}/analytics/overview`, { headers: { Authorization: `Bearer ${t}` } });
      const d = await r.json();
      setAnalytics(d);
    } catch {}
  }, []);

  const fetchMyCerts = useCallback(async (t: string) => {
    if (!t) return;
    try {
      const r = await fetch(`${API}/certificates`, { headers: { Authorization: `Bearer ${t}` } });
      const d = await r.json();
      setMyCerts(Array.isArray(d) ? d : []);
    } catch {}
  }, []);

  const fetchMyRegs = useCallback(async (t: string) => {
    if (!t) return;
    try {
      const r = await fetch(`${API}/my/registrations`, { headers: { Authorization: `Bearer ${t}` } });
      const d = await r.json();
      setMyRegs(Array.isArray(d) ? d : []);
    } catch {}
  }, []);

  useEffect(() => {
    if (token && currentUser) {
      fetchNotifications(token);
      fetchAnalytics(token);
      if (currentUser.role === 'student') {
        fetchMyCerts(token);
        fetchMyRegs(token);
      }
    }
  }, [token, currentUser]);

  const handleLogin = async (email: string) => {
    try {
      const r = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'nextspark123' })
      });
      const d = await r.json();
      if (d.token) {
        setToken(d.token);
        setCurrentUser(d.user);
        // Direct isolated landing page per role
        if (d.user.role === 'committee_head') {
          setPage('committee-head');
        } else if (d.user.role === 'admin') {
          setPage('admin');
        } else {
          setPage('home');
        }
      } else {
        alert(d.error || 'Login failed');
      }
    } catch {
      alert('Backend server unavailable at http://localhost:5001');
    }
  };

  const handleLogout = () => {
    setToken('');
    setCurrentUser(null);
    setPage('home');
    setNotifications([]);
    setAnalytics(null);
    setMyCerts([]);
    setMyRegs([]);
  };

  const navigateToEvent = (id: string) => {
    setSelectedEventId(id);
    setPage('event-detail');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Hash route verification
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/verify/')) {
        setVerifyId(hash.replace('#/verify/', ''));
        setPage('verify');
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (!currentUser) {
    return (
      <NSLanding
        demoUsers={demoUsers}
        onLogin={handleLogin}
        onVerify={(id) => { setVerifyId(id); setPage('verify'); }}
      />
    );
  }

  if (page === 'verify') {
    return (
      <div style={{ padding: '30px 20px', minHeight: '100vh', background: '#f8fafc' }}>
        <NSVerifyPage certId={verifyId} onBack={() => setPage('home')} />
      </div>
    );
  }

  const renderContent = () => {
    switch (page) {
      case 'home':
        return (
          <DevpostDashboardHome
            user={currentUser}
            analytics={analytics}
            myRegs={myRegs}
            myCerts={myCerts}
            onNavigate={setPage}
            onOpenEvent={navigateToEvent}
          />
        );
      case 'events':
        return <NSEventsPage token={token} currentUser={currentUser} onOpenEvent={navigateToEvent} />;
      case 'event-detail':
        return selectedEventId ? (
          <NSEventDetailPage
            eventId={selectedEventId}
            token={token}
            currentUser={currentUser}
            onBack={() => setPage('events')}
            onRefreshRegs={() => fetchMyRegs(token)}
          />
        ) : null;
      case 'my-events':
        return (
          <NSMyEventsPage
            myRegs={myRegs}
            onRefresh={() => fetchMyRegs(token)}
            onOpenEvent={navigateToEvent}
          />
        );
      case 'certificates':
        return (
          <NSCertificatesPage
            certificates={myCerts}
            onRefresh={() => fetchMyCerts(token)}
            onVerify={(id) => { setVerifyId(id); setPage('verify'); }}
          />
        );
      case 'committee-head':
        return (
          <NSCommitteeHeadPage
            token={token}
            currentUser={currentUser}
            onOpenEvent={navigateToEvent}
            onCreateEvent={() => setPage('create-event')}
          />
        );
      case 'create-event':
        return (
          <NSCreateEventPage
            token={token}
            currentUser={currentUser}
            onSuccess={() => setPage('committee-head')}
            onCancel={() => setPage('committee-head')}
          />
        );
      case 'jury':
        return <NSJuryPage token={token} currentUser={currentUser} />;
      case 'admin':
        return <NSAdminPage token={token} currentUser={currentUser} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* ── UNSTOP / DEVPOST TOP NAVBAR (NO CLUNKY SIDEBAR FOR STUDENTS) ── */}
      <header className="devpost-navbar">
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            onClick={() => setPage('home')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <div
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
              }}
            >
              <Zap size={20} fill="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 900, color: '#0f172a', fontSize: '1.15rem', letterSpacing: '-0.02em', lineHeight: 1 }}>
                NextSpark
              </div>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Inter-College Arena
              </div>
            </div>
          </div>

          {/* Links strictly isolated per role */}
          <nav className="devpost-nav-links">
            {currentUser.role === 'student' && (
              <>
                <button
                  onClick={() => setPage('home')}
                  className={`devpost-nav-link ${page === 'home' ? 'active' : ''}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setPage('events')}
                  className={`devpost-nav-link ${page === 'events' ? 'active' : ''}`}
                >
                  Explore Competitions
                </button>
                <button
                  onClick={() => setPage('my-events')}
                  className={`devpost-nav-link ${page === 'my-events' ? 'active' : ''}`}
                >
                  My Registered Events ({myRegs.length})
                </button>
                <button
                  onClick={() => setPage('certificates')}
                  className={`devpost-nav-link ${page === 'certificates' ? 'active' : ''}`}
                >
                  My Certificates ({myCerts.length})
                </button>
              </>
            )}

            {currentUser.role === 'committee_head' && (
              <>
                <button
                  onClick={() => setPage('committee-head')}
                  className={`devpost-nav-link ${page === 'committee-head' ? 'active' : ''}`}
                >
                  Event Operations
                </button>
                <button
                  onClick={() => setPage('create-event')}
                  className={`devpost-nav-link ${page === 'create-event' ? 'active' : ''}`}
                >
                  + Post Event
                </button>
                <button
                  onClick={() => setPage('events')}
                  className={`devpost-nav-link ${page === 'events' ? 'active' : ''}`}
                >
                  All Competitions
                </button>
              </>
            )}

            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => setPage('admin')}
                  className={`devpost-nav-link ${page === 'admin' ? 'active' : ''}`}
                >
                  Governance Panel
                </button>
                <button
                  onClick={() => setPage('committee-head')}
                  className={`devpost-nav-link ${page === 'committee-head' ? 'active' : ''}`}
                >
                  Events Desk
                </button>
                <button
                  onClick={() => setPage('events')}
                  className={`devpost-nav-link ${page === 'events' ? 'active' : ''}`}
                >
                  Competitions
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Right Tools (Strictly isolated, no demo role switches for isolated production feel) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Active Role Tag */}
          <div
            style={{
              padding: '4px 10px',
              borderRadius: 8,
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background:
                currentUser.role === 'student'
                  ? '#eff6ff'
                  : currentUser.role === 'committee_head'
                  ? '#f5f3ff'
                  : '#f1f5f9',
              color:
                currentUser.role === 'student'
                  ? '#2563eb'
                  : currentUser.role === 'committee_head'
                  ? '#7c3aed'
                  : '#0f172a',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
            className="hidden-on-mobile"
          >
            {currentUser.role === 'student'
              ? '🎓 Student Portal'
              : currentUser.role === 'committee_head'
              ? '⚡ Event Head'
              : '🛡️ Administrator'}
          </div>

          {/* Notifications */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: unreadCount > 0 ? '#2563eb' : '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative'
              }}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -3, right: -3, background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '1px 5px', borderRadius: 999 }}>
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NSNotificationsPanel
                notifications={notifications}
                token={token}
                onClose={() => setShowNotifications(false)}
                onRead={() => fetchNotifications(token)}
                onNavigate={(link?: string) => {
                  setShowNotifications(false);
                  if (link?.startsWith('/events/')) {
                    navigateToEvent(link.replace('/events/', ''));
                  } else if (link === '/certificates') {
                    setPage('certificates');
                  }
                }}
              />
            )}
          </div>

          {/* User Profile avatar pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
              {currentUser.name.charAt(0)}
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }} className="hidden-on-mobile">
              {currentUser.name.split(' ')[0]}
            </div>
            <button onClick={handleLogout} title="Log out" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 2 }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="main-container-content" style={{ flex: 1, padding: '28px 24px' }}>
        {renderContent()}
      </main>

      {/* Mobile Floating Action Tabs */}
      <nav className="mobile-bottom-tabs">
        <button onClick={() => setPage('home')} className={`mobile-tab-btn ${page === 'home' ? 'active' : ''}`}>
          <Home size={18} />
          <span>Home</span>
        </button>
        <button onClick={() => setPage('events')} className={`mobile-tab-btn ${page === 'events' ? 'active' : ''}`}>
          <Compass size={18} />
          <span>Explore</span>
        </button>
        {currentUser.role === 'student' ? (
          <>
            <button onClick={() => setPage('my-events')} className={`mobile-tab-btn ${page === 'my-events' ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>Registered</span>
            </button>
            <button onClick={() => setPage('certificates')} className={`mobile-tab-btn ${page === 'certificates' ? 'active' : ''}`}>
              <Award size={18} />
              <span>Certificates</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setPage(currentUser.role === 'admin' ? 'admin' : 'committee-head')}
            className="mobile-tab-btn active"
          >
            <ShieldCheck size={18} />
            <span>Workspace</span>
          </button>
        )}
      </nav>
    </div>
  );
}

// ── Clean Unstop/Devpost Style Home View ──────────────────────────────────
function DevpostDashboardHome({
  user, analytics, myRegs, myCerts, onNavigate, onOpenEvent
}: {
  user: NSUser;
  analytics: NSAnalytics | null;
  myRegs: NSRegistration[];
  myCerts: NSCertificate[];
  onNavigate: (p: Page) => void;
  onOpenEvent: (id: string) => void;
}) {
  const [trendingEvents, setTrendingEvents] = useState<NSEvent[]>([]);

  useEffect(() => {
    fetch(`${API}/events?status=Open`)
      .then(r => r.json())
      .then(d => setTrendingEvents(Array.isArray(d) ? d.slice(0, 6) : []))
      .catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: 4 }}>
            Welcome back
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {user.name} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            {user.college_name} · {user.department || 'Autonomous Institution'}
          </p>
        </div>

        {/* Quick actions depending on role */}
        <div style={{ display: 'flex', gap: 10 }}>
          {user.role === 'student' ? (
            <>
              <button onClick={() => onNavigate('events')} className="btn-unstop-primary">
                Browse Competitions <ArrowRight size={15} />
              </button>
              {myCerts.length > 0 && (
                <button onClick={() => onNavigate('certificates')} className="btn-unstop-secondary">
                  🏆 My Certificates ({myCerts.length})
                </button>
              )}
            </>
          ) : user.role === 'committee_head' ? (
            <>
              <button onClick={() => onNavigate('create-event')} className="btn-unstop-primary">
                <Plus size={15} /> Post New Event
              </button>
              <button onClick={() => onNavigate('committee-head')} className="btn-unstop-secondary">
                Live Operations Center
              </button>
            </>
          ) : user.role === 'jury' ? (
            <button onClick={() => onNavigate('jury')} className="btn-unstop-primary">
              Open Evaluation Pad <ArrowRight size={15} />
            </button>
          ) : (
            <button onClick={() => onNavigate('admin')} className="btn-unstop-primary">
              Governance & Registry <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row (Dedicated Student Stats) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div
          onClick={() => onNavigate('my-events')}
          style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Enrolled Competitions</div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#2563eb', marginTop: 4 }}>{myRegs.length}</div>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 2 }}>Click to track ongoing status →</div>
        </div>

        <div
          onClick={() => onNavigate('certificates')}
          style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Earned E-Certificates</div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#16a34a', marginTop: 4 }}>{myCerts.length}</div>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 2 }}>Verifiable digital honors →</div>
        </div>

        <div
          onClick={() => onNavigate('events')}
          style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Available Competitions</div>
          <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#d97706', marginTop: 4 }}>{analytics?.kpis.openEvents || trendingEvents.length}</div>
          <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: 2 }}>Explore inter-college hackathons →</div>
        </div>
      </div>

      {/* Trending Competitions Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              🔥 Recommended Competitions for You
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.86rem', margin: '2px 0 0' }}>
              Inter-college hackathons, coding sprints, and symposiums open for registration.
            </p>
          </div>
          <button onClick={() => onNavigate('events')} style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
            Browse All ({trendingEvents.length}) →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
          {trendingEvents.map(ev => (
            <DevpostEventCard key={ev.id} event={ev} onClick={() => onOpenEvent(ev.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function getStatusBg(status: string) {
  const map: Record<string, string> = {
    Open: '#dcfce7',
    Ongoing: '#fef3c7',
    Closed: '#fee2e2',
    Completed: '#f1f5f9',
    Registered: '#eff6ff',
  };
  return map[status] || '#f1f5f9';
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    Open: '#15803d',
    Ongoing: '#b45309',
    Closed: '#b91c1c',
    Completed: '#64748b',
    Registered: '#2563eb',
  };
  return map[status] || '#64748b';
}

export { API };
