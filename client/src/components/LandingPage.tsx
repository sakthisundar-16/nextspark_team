import React from 'react';
import { Award, ShieldCheck, CheckCircle2, ArrowRight, Zap, BarChart3, QrCode } from 'lucide-react';

interface LandingProps {
  onLogin: () => void;
  onVerify: () => void;
}

export const LandingPage: React.FC<LandingProps> = ({ onLogin, onVerify }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      {/* Top Navigation Bar */}
      <nav style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(37,99,235,0.3)' }}>
              E
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#0f172a' }}>
                EXTERNIQ
              </div>
              <div style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                Institutional Intelligence
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={onVerify}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <QrCode size={16} /> Verify Certificate
            </button>
            <button
              onClick={onLogin}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                background: '#2563eb',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
              }}
            >
              Sign In / Demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#2563eb', padding: '6px 16px', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '24px', border: '1px solid #bfdbfe' }}>
          <SparkleIcon /> Next-Gen External Engagement Platform for Universities
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.2rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, color: '#0f172a', maxWidth: '900px', margin: '0 auto 20px' }}>
          External Participation.<br />
          <span style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Verified Institutional Impact.
          </span>
        </h1>

        <p style={{ fontSize: '1.2rem', color: '#475569', maxWidth: '680px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          One intelligent platform to centrally capture, verify, certify, and measure every hackathon, conference, workshop, and competition across your institution.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '60px' }}>
          <button
            onClick={onLogin}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 32px',
              borderRadius: '12px',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '1.05rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(37,99,235,0.35)'
            }}
          >
            Explore Platform Demo <ArrowRight size={18} />
          </button>

          <button
            onClick={onVerify}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#1e293b',
              border: '1px solid #cbd5e1',
              fontSize: '1.05rem',
              fontWeight: 600
            }}
          >
            <ShieldCheck size={20} color="#059669" />
            Verify a Certificate
          </button>
        </div>

        {/* Core Value Chain */}
        <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '36px', maxWidth: '1080px', margin: '0 auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.08em', marginBottom: '20px' }}>
            The EXTERNIQ Value Continuum
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', textAlign: 'center' }}>
            {[
              { step: '01', title: 'Participation', desc: 'Centralized tracking' },
              { step: '02', title: 'Evidence', desc: 'PDF / certificate vault' },
              { step: '03', title: 'AI Extraction', desc: 'Auto field parsing' },
              { step: '04', title: 'Verification', desc: 'Faculty audit workflow' },
              { step: '05', title: 'E-Certificate', desc: 'Unique QR generation' },
              { step: '06', title: 'Impact', desc: 'Accreditation analytics' }
            ].map((item, idx) => (
              <div key={idx} style={{ padding: '16px 10px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>{item.step}</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', margin: '4px 0' }}>{item.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before vs After Section */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '60px 24px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '36px', color: '#0f172a' }}>
          Replacing Disconnected Records with Verifiable Intelligence
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Before */}
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991b1b', marginBottom: '16px' }}>
              ❌ Traditional Institution Reality
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#7f1d1d' }}>
              <li>• Disconnected Excel spreadsheets scattered across departments</li>
              <li>• Certificates sent haphazardly over WhatsApp and emails</li>
              <li>• No duplicate detection (students claiming same event twice)</li>
              <li>• Tedious manual verification during NAAC / NIRF audit times</li>
              <li>• Zero institutional insight on top performing domains</li>
            </ul>
          </div>

          {/* After */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534', marginBottom: '16px' }}>
              ✓ With EXTERNIQ Platform
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#14532d' }}>
              <li>• Unified digital registry across all faculties & students</li>
              <li>• AI-assisted certificate parsing with confidence scores</li>
              <li>• Multi-level verification timeline with audit logging</li>
              <li>• Instant verifiable e-certificates with tamper-proof QR codes</li>
              <li>• Real-time Impact Center scoring and Copilot query intelligence</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);
