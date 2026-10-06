import React, { useState } from 'react';
import { NSUser } from '../ns-types';
import {
  ArrowRight, ShieldCheck, Search, ChevronRight, CheckCircle2,
  Lock, Award, Users, Compass, ExternalLink, Sparkles
} from 'lucide-react';

interface Props {
  demoUsers: NSUser[];
  onLogin: (email: string) => void;
  onVerify: (id: string) => void;
}

export function NSLanding({ demoUsers, onLogin, onVerify }: Props) {
  const [verifyId, setVerifyId] = useState('NSP-2026-EVT5-001');
  const [activeTab, setActiveTab] = useState<'student' | 'coordinator' | 'admin'>('student');

  const portalAccounts = [
    {
      role: 'student',
      label: 'Student Participant',
      email: 'student@nextspark.in',
      badge: 'Competitions & Honors',
      desc: 'Browse engineering hackathons, register teams, follow live event feeds, and access your tamper-proof e-certificates.',
      perks: ['Inter-College Hackathons & Contests', 'Live Tournament Progress', 'Instant Downloadable Verified Certificates'],
      cta: 'Continue to Student Portal',
      themeColor: '#2563eb',
    },
    {
      role: 'committee_head',
      label: 'Event Operations Head',
      email: 'head1@nextspark.in',
      badge: 'Host & Manage Events',
      desc: 'Host intra and inter-college competitions, directly score teams, broadcast live updates, and auto-dispatch custom-designed certificates.',
      perks: ['One-Click Event Lifecycle Management', 'Direct Team Evaluation & Scoring', 'Customizable Certificate Template Engine'],
      cta: 'Open Host Operations Desk',
      themeColor: '#4f46e5',
    },
    {
      role: 'admin',
      label: 'Platform Administrator',
      email: 'admin@nextspark.in',
      badge: 'Institutional Governance',
      desc: 'Campus registry, centralized event governance, system telemetry, and credential audit controls across all partner colleges.',
      perks: ['Affiliated Campus Management', 'Centralized Security & Role Audit', 'Statewide Analytics & Telemetry'],
      cta: 'Access Governance Panel',
      themeColor: '#0f172a',
    },
  ];

  const currentPortal = portalAccounts.find(p => p.role === (activeTab === 'coordinator' ? 'committee_head' : activeTab)) || portalAccounts[0];

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── MINIMAL PROFESSIONAL TOP NAVBAR ── */}
      <header
        style={{
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Clean Wordmark Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1rem',
                letterSpacing: '-0.04em',
              }}
            >
              N
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
                NextSpark
              </div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Collegiate Network
              </div>
            </div>
          </div>

          {/* Quick Certificate Verify & Access */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '4px 6px 4px 12px',
              }}
              className="hidden-on-mobile"
            >
              <Search size={14} color="#64748b" style={{ marginRight: 6 }} />
              <input
                value={verifyId}
                onChange={e => setVerifyId(e.target.value)}
                placeholder="Verify Credential ID..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.82rem',
                  color: '#0f172a',
                  width: 175,
                }}
              />
              <button
                onClick={() => onVerify(verifyId)}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Verify
              </button>
            </div>

            <button
              onClick={() => onLogin('student@nextspark.in')}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* ── PROFESSIONAL HERO SECTION ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '70px 24px 50px', textAlign: 'center' }}>
        {/* Subtle Institutional Tag */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 20,
          }}
        >
          <ShieldCheck size={14} color="#2563eb" /> Centralized Inter-College Platform
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.4rem, 5.2vw, 3.8rem)',
            fontWeight: 900,
            color: '#0f172a',
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            maxWidth: 880,
            margin: '0 auto 20px',
          }}
        >
          Unified Arena for Inter-College Competitions & Digital Credentials.
        </h1>

        <p
          style={{
            fontSize: '1.08rem',
            color: '#64748b',
            lineHeight: 1.6,
            maxWidth: 640,
            margin: '0 auto 40px',
          }}
        >
          Organize hackathons, evaluate participating teams directly, and issue verified cryptographic e-certificates upon completion without friction.
        </p>

        {/* ── REFINED SINGLE PORTAL AUTH SWITCHER (CLEAN & PROFESSIONAL) ── */}
        <div
          style={{
            maxWidth: 680,
            margin: '0 auto',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 18,
            boxShadow: '0 12px 36px rgba(15,23,42,0.06)',
            padding: '24px 28px',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Select Account Role to Enter
          </div>

          {/* Segmented Tab Controls */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: 4,
              marginBottom: 24,
            }}
          >
            {[
              { id: 'student', label: 'Student' },
              { id: 'coordinator', label: 'Event Operations' },
              { id: 'admin', label: 'Campus Admin' },
            ].map(tab => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: 'none',
                    fontSize: '0.84rem',
                    fontWeight: isSelected ? 800 : 600,
                    background: isSelected ? '#ffffff' : 'transparent',
                    color: isSelected ? '#0f172a' : '#64748b',
                    boxShadow: isSelected ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Persona Details Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  {currentPortal.label}
                </h3>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: '#f1f5f9',
                    color: '#475569',
                  }}
                >
                  {currentPortal.email}
                </span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0, lineHeight: 1.5 }}>
                {currentPortal.desc}
              </p>
            </div>

            {/* Feature Perks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
              {currentPortal.perks.map((perk, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                  <CheckCircle2 size={15} color="#2563eb" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>

            {/* Direct Login Button */}
            <button
              onClick={() => onLogin(currentPortal.email)}
              style={{
                width: '100%',
                padding: '13px 20px',
                borderRadius: 10,
                border: 'none',
                background: currentPortal.themeColor,
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{currentPortal.cta}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* ── KEY PLATFORM PILLARS (CLEAN & SUBTLE) ── */}
        <div
          style={{
            maxWidth: 1000,
            margin: '64px auto 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 28,
            textAlign: 'left',
            borderTop: '1px solid #e2e8f0',
            paddingTop: 48,
          }}
        >
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              Direct Event Lifecycle
            </div>
            <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.5, margin: 0 }}>
              Event Operations Heads manage status transitions directly (`Open` ➔ `Ongoing` ➔ `Completed`) with real-time participant tracking.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              Autonomous Certification
            </div>
            <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.5, margin: 0 }}>
              When competitions conclude, verified e-certificates generate automatically for all student participants with tamper-proof QR signatures.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
              Institution & Scope Governance
            </div>
            <p style={{ color: '#64748b', fontSize: '0.84rem', lineHeight: 1.5, margin: 0 }}>
              Strict ownership model ensures coordinators only manage events created by them, maintaining integrity across college campuses.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: '1px solid #e2e8f0',
          padding: '28px 24px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.8rem',
        }}
      >
        <div>NextSpark Collegiate Competition & Institutional Credentials Infrastructure.</div>
      </footer>
    </div>
  );
}
