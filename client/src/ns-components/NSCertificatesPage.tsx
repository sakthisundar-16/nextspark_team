import React, { useState } from 'react';
import { NSCertificate } from '../ns-types';
import { Award, Download, ExternalLink, QrCode, CheckCircle2, Shield, Share2, Sparkles, Printer } from 'lucide-react';
import { useToast } from './ToastContext';

interface Props {
  certificates: NSCertificate[];
  onRefresh: () => void;
  onVerify: (id: string) => void;
}

const API = 'http://localhost:5001/api2';

export function NSCertificatesPage({ certificates, onRefresh, onVerify }: Props) {
  const { success } = useToast();
  const [selectedCert, setSelectedCert] = useState<NSCertificate | null>(
    certificates.length > 0 ? certificates[0] : null
  );

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/#/verify/${id}`;
    navigator.clipboard.writeText(url);
    success('Verification Link Copied', 'Share this URL with recruiters or institutional boards.');
  };

  // Parse certificate design if custom template was configured by coordinator
  const getDesign = (cert: NSCertificate) => {
    let d: any = {};
    if (cert.certificate_design) {
      try {
        d = JSON.parse(cert.certificate_design);
      } catch {}
    }
    const theme = d.theme || 'gold';
    const borderCol = d.borderColor || (theme === 'cyber' ? '#06b6d4' : theme === 'royal' ? '#6366f1' : '#d97706');
    const orgSub = d.orgSubtitle || 'Centralized Inter-College Engineering Consortium';
    const issuedBy = d.issuedBy || cert.issued_by || 'Event Operations Head';
    const certTitle = d.certificateTitle || 'Certificate of Merit & Achievement';
    return { theme, borderCol, orgSub, issuedBy, certTitle };
  };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 999,
              background: '#eff6ff',
              color: '#2563eb',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            <Shield size={13} /> Verifiable Institutional Credentials
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            My Certificates & Honors
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0' }}>
            Official digital credentials issued by hosting event coordinators upon competition conclusion.
          </p>
        </div>

        <button onClick={onRefresh} className="btn-brand-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          ↻ Refresh Credentials
        </button>
      </div>

      {certificates.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '70px 24px',
            background: '#ffffff',
            borderRadius: 16,
            border: '1px dashed #cbd5e1',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎓</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            No Credentials Earned Yet
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: 450, margin: '0 auto' }}>
            Complete your registered competitions. When the Event Operations Head concludes the event, your official verifiable e-certificate will appear here automatically.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Certificate Previews Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {certificates.map(cert => {
              const isSelected = selectedCert?.id === cert.id;
              const { borderCol } = getDesign(cert);
              return (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  style={{
                    background: isSelected ? '#ffffff' : '#ffffff',
                    border: isSelected ? `2px solid ${borderCol}` : '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: 18,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 6px 20px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background:
                          cert.position === 'Winner'
                            ? '#fef3c7'
                            : cert.position === 'Runner-Up'
                            ? '#f1f5f9'
                            : '#eff6ff',
                        color:
                          cert.position === 'Winner'
                            ? '#b45309'
                            : cert.position === 'Runner-Up'
                            ? '#475569'
                            : '#2563eb',
                        textTransform: 'uppercase',
                      }}
                    >
                      🏆 {cert.position}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> {cert.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                    {cert.event_title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {cert.college_name || 'Hosting Institution'} · Ref: {cert.id}
                  </div>
                </div>
              );
            })}
          </div>

          {/* High-Fidelity Certificate Showcase Canvas */}
          {selectedCert && (() => {
            const { theme, borderCol, orgSub, issuedBy, certTitle } = getDesign(selectedCert);
            return (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 18,
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  position: 'sticky',
                  top: 90,
                }}
              >
                {/* Printable Frame Preview */}
                <div
                  style={{
                    background: '#ffffff',
                    border: `10px double ${borderCol}`,
                    borderRadius: 8,
                    padding: '28px 22px',
                    textAlign: 'center',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
                    position: 'relative',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.14em', color: '#64748b', fontWeight: 800, marginBottom: 4 }}>
                    NextSpark Collegiate Credentials Registry
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', marginBottom: 2 }}>
                    {selectedCert.college_name || 'Inter-College Organizing Arena'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 14 }}>
                    {orgSub}
                  </div>

                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: borderCol, textTransform: 'uppercase', letterSpacing: '0.04em', margin: '10px 0 6px' }}>
                    {certTitle}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', marginBottom: 6 }}>
                    This is proudly awarded in recognition of outstanding merit to
                  </div>

                  <h2 style={{ fontSize: '1.75rem', fontWeight: 900, fontStyle: 'italic', color: '#0f172a', margin: '0 0 10px', textDecoration: `underline ${borderCol}`, textUnderlineOffset: 6 }}>
                    {selectedCert.student_name}
                  </h2>

                  <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, margin: '0 auto 16px', maxWidth: 440 }}>
                    for exceptional achievement and ranking as <strong style={{ color: borderCol, fontSize: '0.95rem' }}>{selectedCert.position}</strong> in the state-level competition
                    <div style={{ fontWeight: 800, color: '#0f172a', marginTop: 4, fontSize: '1.05rem' }}>
                      {selectedCert.event_title}
                    </div>
                  </div>

                  {/* Signatures & QR */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 14, marginTop: 18 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#1e293b' }}>{issuedBy.split(' ')[0]}</div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>{issuedBy}</div>
                      <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Event Operations Head</div>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.64rem', color: '#64748b' }}>
                      <div style={{ width: 44, height: 44, border: '1.5px solid #0f172a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.64rem', background: '#f8fafc', marginBottom: 3 }}>
                        QR
                      </div>
                      <div>ID: {selectedCert.id}</div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.95rem', fontStyle: 'italic', color: '#1e293b' }}>Dean Academic</div>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>Governing Board</div>
                      <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Institutional Dean</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <a
                    href={`${API}/certificates/download/${selectedCert.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-brand-primary"
                    style={{
                      background: '#10b981',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={16} /> Download & Print Certificate
                  </a>
                  <button
                    onClick={() => onVerify(selectedCert.id)}
                    className="btn-brand-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Shield size={16} /> Verify Authenticity
                  </button>
                  <button
                    onClick={() => handleCopyLink(selectedCert.id)}
                    className="btn-brand-secondary"
                    title="Copy verification link"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Share2 size={16} /> Share
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
