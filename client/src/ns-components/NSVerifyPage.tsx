import React, { useState, useEffect } from 'react';
import { NSCertificate } from '../ns-types';
import { ShieldCheck, Search, CheckCircle, AlertTriangle, Download, ArrowLeft, ExternalLink, Calendar, Building, Award } from 'lucide-react';

interface Props {
  initialId?: string;
  certId?: string;
  onBack?: () => void;
}

const API = 'http://localhost:5001/api2';

export function NSVerifyPage({ initialId, certId: propCertId, onBack }: Props) {
  const effectiveInitial = propCertId || initialId || '';
  const [certId, setCertId] = useState(effectiveInitial);
  const [cert, setCert] = useState<NSCertificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleVerify = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setError('');
    setCert(null);
    setSearched(true);

    try {
      const res = await fetch(`${API}/certificates/verify/${encodeURIComponent(idToVerify.trim())}`);
      if (!res.ok) {
        throw new Error('Certificate not found or verification code is invalid');
      }
      const data = await res.json();
      setCert(data);
    } catch (err: any) {
      setError(err.message || 'Could not verify certificate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleVerify(initialId);
    }
  }, [initialId]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', color: '#f8fafc', padding: '10px 0 40px' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: '#a5b4fc',
            cursor: 'pointer',
            fontSize: '0.88rem',
            marginBottom: 20
          }}
        >
          <ArrowLeft size={16} /> Back to Platform
        </button>
      )}

      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(99,102,241,0.4)',
            marginBottom: 16
          }}
        >
          <ShieldCheck size={28} color="#818cf8" />
        </div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Official Certificate Verification
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: 500, margin: '0 auto' }}>
          Authenticate institutional credentials, inter-college ranks, and event participation secured on NextSpark.
        </p>
      </div>

      {/* Search Input Box */}
      <div
        style={{
          background: '#131322',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: 8,
          display: 'flex',
          gap: 8,
          marginBottom: 32,
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 14, color: '#64748b' }}>
          <Search size={20} />
        </div>
        <input
          type="text"
          value={certId}
          onChange={e => setCertId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleVerify(certId)}
          placeholder="Enter Certificate ID (e.g. CERT-2026-NSPK-001)"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: '0.95rem'
          }}
        />
        <button
          onClick={() => handleVerify(certId)}
          disabled={loading || !certId.trim()}
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            color: '#fff',
            borderRadius: 10,
            padding: '12px 24px',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: loading || !certId.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Verifying...' : 'Verify Now'}
        </button>
      </div>

      {/* Result Display */}
      {error && searched && (
        <div
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 14,
            padding: '24px',
            textAlign: 'center',
            color: '#f87171'
          }}
        >
          <AlertTriangle size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700 }}>Verification Failed</h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#fca5a5' }}>{error}</p>
        </div>
      )}

      {cert && (
        <div
          style={{
            background: '#131322',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(16,185,129,0.1)'
          }}
        >
          {/* Status Ribbon */}
          <div
            style={{
              background: 'linear-gradient(90deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))',
              borderBottom: '1px solid rgba(16,185,129,0.2)',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={18} color="#10b981" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Authentic & Verified Certificate
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Ref: <code style={{ color: '#cbd5e1' }}>{cert.id}</code>
            </span>
          </div>

          {/* Certificate Card Content */}
          <div style={{ padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#818cf8', fontWeight: 700 }}>
                NextSpark Centralized Credential
              </span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '8px 0 4px' }}>
                {cert.student_name}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                {cert.college_name || 'Participating Institution'}
              </p>
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '20px 24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16,
                marginBottom: 24
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Event Title</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', marginTop: 2 }}>{cert.event_title}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Position / Recognition</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', marginTop: 2 }}>🏆 {cert.position}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Issuing Body</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0', marginTop: 2 }}>{cert.issued_by}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Issued Date</span>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0', marginTop: 2 }}>
                  {new Date(cert.issued_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a
                href={`${API}/certificates/download/${cert.id}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '10px 22px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                }}
              >
                <Download size={16} /> Download Official PDF / E-Cert
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
