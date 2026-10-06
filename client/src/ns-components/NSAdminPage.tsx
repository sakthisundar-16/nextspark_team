import React, { useState, useEffect } from 'react';
import { NSUser, NSCollege } from '../ns-types';
import {
  Building2, Users, Shield, Plus, X, Search, Activity, BarChart3,
  Calendar, CheckCircle2, TrendingUp, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { useToast } from './ToastContext';

const API = 'http://localhost:5001/api2';

interface Props {
  token: string;
  currentUser: NSUser;
}

export function NSAdminPage({ token, currentUser }: Props) {
  const { success, error: toastError } = useToast();
  const [tab, setTab] = useState<'overview' | 'colleges' | 'users'>('overview');
  const [colleges, setColleges] = useState<NSCollege[]>([]);
  const [users, setUsers] = useState<NSUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Add college modal & form
  const [showAddCollege, setShowAddCollege] = useState(false);
  const [clgName, setClgName] = useState('');
  const [clgCode, setClgCode] = useState('');
  const [clgLoc, setClgLoc] = useState('');
  const [clgLoading, setClgLoading] = useState(false);

  // Add user modal & form
  const [showAddUser, setShowAddUser] = useState(false);
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPw, setUPw] = useState('nextspark123');
  const [uRole, setURole] = useState('student');
  const [uCollege, setUCollege] = useState('');
  const [uDept, setUDept] = useState('');
  const [uReg, setUReg] = useState('');
  const [uLoading, setULoading] = useState(false);

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, uRes, aRes] = await Promise.all([
        fetch(`${API}/colleges`, { headers }),
        fetch(`${API}/users`, { headers }),
        fetch(`${API}/analytics/overview`, { headers }),
      ]);
      setColleges(await cRes.json());
      setUsers(await uRes.json());
      setAnalytics(await aRes.json());
    } catch {
      toastError('Failed to load administrative data');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clgName || !clgCode) return;
    setClgLoading(true);
    try {
      const r = await fetch(`${API}/colleges`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: clgName, code: clgCode, location: clgLoc }),
      });
      const d = await r.json();
      if (r.ok) {
        success('College onboarded successfully', `${clgName} added to registry`);
        setColleges(prev => [...prev, d]);
        setClgName('');
        setClgCode('');
        setClgLoc('');
        setShowAddCollege(false);
      } else {
        toastError(d.error || 'Failed to onboard college');
      }
    } catch {
      toastError('Network error onboarding college');
    }
    setClgLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uName || !uEmail) return;
    setULoading(true);
    try {
      const r = await fetch(`${API}/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: uName,
          email: uEmail,
          password: uPw,
          role: uRole,
          college_id: uCollege || undefined,
          department: uDept || undefined,
          reg_number: uReg || undefined,
        }),
      });
      const d = await r.json();
      if (r.ok) {
        success('User created successfully', `${uName} registered as ${uRole}`);
        setUsers(prev => [d, ...prev]);
        setUName('');
        setUEmail('');
        setShowAddUser(false);
      } else {
        toastError(d.error || 'Failed to create user');
      }
    } catch {
      toastError('Network error creating user');
    }
    setULoading(false);
  };

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    const matchSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.college_name?.toLowerCase().includes(q);
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Institutional Command Center Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.9) 0%, rgba(15, 30, 56, 0.75) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: 20,
          padding: '28px 32px',
          boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 12px',
                borderRadius: 999,
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#38bdf8',
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
              }}
            >
              <Shield size={13} /> Institutional Command Center
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Platform Governance & Infrastructure
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, maxWidth: 650 }}>
              Audit institutional participation, manage certified colleges, provision role access, and monitor ecosystem-wide throughput.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowAddCollege(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 16px',
                borderRadius: 10,
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} /> Add College
            </button>
            <button
              onClick={() => setShowAddUser(true)}
              className="btn-brand-primary"
              style={{
                background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
                fontSize: '0.84rem',
                padding: '9px 18px',
              }}
            >
              <Plus size={15} /> Provision User
            </button>
          </div>
        </div>
      </div>

      {/* Segmented Navigation */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          background: 'rgba(17, 24, 39, 0.7)',
          padding: 6,
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          width: 'fit-content',
        }}
      >
        {[
          { key: 'overview', label: 'Telemetry & Overview', icon: Activity },
          { key: 'colleges', label: `Colleges (${colleges.length})`, icon: Building2 },
          { key: 'users', label: `Users (${users.length})`, icon: Users },
        ].map(t => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.84rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                border: isActive ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <t.icon size={15} color={isActive ? '#38bdf8' : '#64748b'} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & TELEMETRY */}
      {tab === 'overview' && analytics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Executive KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { label: 'Registered Institutions', val: analytics.kpis.totalColleges, sub: 'Affiliated across TN', color: '#06b6d4', icon: Building2 },
              { label: 'Active Competitions', val: analytics.kpis.openEvents, sub: `${analytics.kpis.totalEvents} Total hosted`, color: '#10b981', icon: Calendar },
              { label: 'Enrolled Participants', val: analytics.kpis.totalStudents, sub: `${analytics.kpis.totalRegistrations} Registrations logged`, color: '#6366f1', icon: Users },
              { label: 'Issued Credentials', val: analytics.kpis.totalCertificates, sub: '100% Cryptographically verified', color: '#f59e0b', icon: Shield },
            ].map(k => (
              <div
                key={k.label}
                style={{
                  background: 'rgba(22, 30, 49, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: '20px 22px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{k.label}</span>
                  <k.icon size={18} color={k.color} />
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#f8fafc', lineHeight: 1, marginBottom: 6 }}>
                  {k.val}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Operational Timeline & Institutional Feed */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
            {/* Top Events Throughput */}
            <div style={{ background: 'rgba(22, 30, 49, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="#06b6d4" /> High-Throughput Competitions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {analytics.topEvents?.map((e: any) => (
                  <div
                    key={e.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 10,
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.88rem' }}>{e.title}</div>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Status: {e.status}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#06b6d4' }}>{e.registrations}</span>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>enrolled</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Activity Feed */}
            <div style={{ background: 'rgba(22, 30, 49, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 16, padding: 22 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={16} color="#10b981" /> Live Registration Log
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analytics.recentActivity?.slice(0, 5).map((a: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.84rem' }}>{a.student_name}</div>
                      <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Registered for {a.event_title}</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {new Date(a.registered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLLEGES MANAGEMENT */}
      {tab === 'colleges' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {colleges.map(c => (
              <div
                key={c.id}
                style={{
                  background: 'rgba(22, 30, 49, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 16,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: 'rgba(6, 182, 212, 0.15)',
                      color: '#38bdf8',
                    }}
                  >
                    {c.code}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Verified Institution</span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{c.name}</h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>📍 {c.location || 'Tamil Nadu, India'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: USER PROVISIONING */}
      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
              <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search user by name, email, or college..."
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={e => setUserRoleFilter(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                background: '#161e31',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                fontSize: '0.85rem',
              }}
            >
              <option value="all">Role: All Roles</option>
              <option value="admin">Administrators</option>
              <option value="committee_head">Committee Heads</option>
              <option value="jury">Judges / Jury</option>
              <option value="student">Students</option>
            </select>
          </div>

          {/* Table */}
          <div
            style={{
              background: 'rgba(22, 30, 49, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>User Identity</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Institution</th>
                  <th style={{ padding: '14px 18px', fontWeight: 600 }}>Department</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.15s ease' }}
                  >
                    <td style={{ padding: '12px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px 18px' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background:
                            u.role === 'admin'
                              ? 'rgba(6, 182, 212, 0.15)'
                              : u.role === 'committee_head'
                              ? 'rgba(139, 92, 246, 0.15)'
                              : u.role === 'jury'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(99, 102, 241, 0.15)',
                          color:
                            u.role === 'admin'
                              ? '#38bdf8'
                              : u.role === 'committee_head'
                              ? '#c4b5fd'
                              : u.role === 'jury'
                              ? '#6ee7b7'
                              : '#a5b4fc',
                          textTransform: 'uppercase',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 18px', color: '#cbd5e1' }}>{u.college_name || '—'}</td>
                    <td style={{ padding: '12px 18px', color: '#94a3b8' }}>{u.department || 'General'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add College */}
      {showAddCollege && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setShowAddCollege(false)}
        >
          <div
            style={{
              background: '#131b2e',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: 20,
              padding: 28,
              width: '100%',
              maxWidth: 480,
              boxShadow: '0 24px 50px rgba(0,0,0,0.7)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Onboard New College</h3>
              <button onClick={() => setShowAddCollege(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCollege} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>College Name *</label>
                <input
                  required
                  value={clgName}
                  onChange={e => setClgName(e.target.value)}
                  placeholder="e.g. Madras Institute of Technology"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1c263d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>College Code *</label>
                  <input
                    required
                    value={clgCode}
                    onChange={e => setClgCode(e.target.value)}
                    placeholder="e.g. MIT"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1c263d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>Location</label>
                  <input
                    value={clgLoc}
                    onChange={e => setClgLoc(e.target.value)}
                    placeholder="e.g. Chennai"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1c263d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowAddCollege(false)} className="btn-brand-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={clgLoading} className="btn-brand-primary" style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}>
                  {clgLoading ? 'Onboarding...' : 'Confirm College'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add User */}
      {showAddUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
          onClick={() => setShowAddUser(false)}
        >
          <div
            style={{
              background: '#131b2e',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: 20,
              padding: 28,
              width: '100%',
              maxWidth: 500,
              boxShadow: '0 24px 50px rgba(0,0,0,0.7)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>Provision New User</h3>
              <button onClick={() => setShowAddUser(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>Full Name *</label>
                <input
                  required
                  value={uName}
                  onChange={e => setUName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1c263d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={uEmail}
                    onChange={e => setUEmail(e.target.value)}
                    placeholder="rajesh@college.edu"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1c263d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>System Role</label>
                  <select
                    value={uRole}
                    onChange={e => setURole(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1c263d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    <option value="student">Student</option>
                    <option value="committee_head">Committee Head</option>
                    <option value="jury">Jury / Judge</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>Institution</label>
                  <select
                    value={uCollege}
                    onChange={e => setUCollege(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1c263d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    <option value="">Select College...</option>
                    {colleges.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: 6 }}>Department</label>
                  <input
                    value={uDept}
                    onChange={e => setUDept(e.target.value)}
                    placeholder="e.g. CSE / IT"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 8, background: '#1c263d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setShowAddUser(false)} className="btn-brand-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={uLoading} className="btn-brand-primary" style={{ background: 'linear-gradient(135deg,#0284c7,#06b6d4)' }}>
                  {uLoading ? 'Provisioning...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
