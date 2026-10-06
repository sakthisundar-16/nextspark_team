import React from 'react';
import { Award, ShieldCheck, Download, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

interface CertificateProps {
  cert: {
    certificate_id: string;
    issued_to_name: string;
    event_name: string;
    achievement: string;
    department_name: string;
    institution_name?: string;
    issue_date: string;
    signer_name?: string;
    signer_designation?: string;
    status: string;
    qr_code_data?: string;
    template_id?: string;
  };
  onDownload?: () => void;
  onVerify?: () => void;
  showActions?: boolean;
}

export const CertificateTemplateRenderer: React.FC<CertificateProps> = ({
  cert,
  onDownload,
  onVerify,
  showActions = true
}) => {
  const isRevoked = cert.status === 'REVOKED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Certificate Frame */}
      <div
        id="certificate-print-node"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '860px',
          aspectRatio: '1.414 / 1', // International landscape ratio
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          border: '12px solid #0f172a',
          color: '#0f172a',
          boxSizing: 'border-box'
        }}
      >
        {/* Subtle decorative security background patterns */}
        <div
          style={{
            position: 'absolute',
            inset: 6,
            border: '2px solid #d97706',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 10,
            border: '1px dashed #cbd5e1',
            pointerEvents: 'none'
          }}
        />

        {/* Revoked watermark if applicable */}
        {isRevoked && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-30deg)',
              fontSize: '4.5rem',
              fontWeight: 900,
              color: 'rgba(239, 68, 68, 0.22)',
              letterSpacing: '0.1em',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            REVOKED / VOID
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
            <Award size={36} color="#d97706" />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1e293b' }}>
              {cert.institution_name || 'National Institute of Technology & Engineering'}
            </h4>
          </div>
          <div style={{ fontSize: '0.82rem', letterSpacing: '0.12em', color: '#64748b', textTransform: 'uppercase' }}>
            Office of External Engagements & Institutional Intelligence
          </div>
          <div style={{ height: '2px', width: '90px', background: 'linear-gradient(90deg, #d97706, #2563eb)', margin: '14px auto 0' }} />
        </div>

        {/* Certificate Title */}
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, margin: '10px 0' }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', serif",
              fontSize: '2.4rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#0f172a',
              textTransform: 'uppercase',
              marginBottom: '6px'
            }}
          >
            Certificate of Recognition
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#64748b', fontStyle: 'italic' }}>
            This verifiable institutional credential is presented with honor to
          </p>

          {/* Participant Name */}
          <div
            style={{
              fontFamily: "'Plus Jakarta Sans', serif",
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#1d4ed8',
              margin: '8px 0',
              borderBottom: '2px solid #e2e8f0',
              display: 'inline-block',
              padding: '0 28px 4px'
            }}
          >
            {cert.issued_to_name}
          </div>

          {/* Department */}
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
            Department of {cert.department_name}
          </div>

          {/* Achievement Description */}
          <p style={{ maxWidth: '640px', margin: '12px auto 0', fontSize: '0.95rem', color: '#475569', lineHeight: 1.5 }}>
            In recognition of outstanding performance as <strong style={{ color: '#0f172a' }}>{cert.achievement}</strong> at{' '}
            <strong style={{ color: '#0f172a' }}>"{cert.event_name}"</strong>. This record has been verified against institutional standards and accredited under EXTERNIQ.
          </p>
        </div>

        {/* Footer & QR Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 2,
            borderTop: '1px solid #e2e8f0',
            paddingTop: '18px'
          }}
        >
          {/* Signer Block */}
          <div style={{ textAlign: 'left', minWidth: '180px' }}>
            <div style={{ fontFamily: 'cursive', fontSize: '1.25rem', color: '#1e293b', marginBottom: '2px' }}>
              {cert.signer_name || 'Dr. K. R. Ramanathan'}
            </div>
            <div style={{ width: '150px', height: '1.5px', background: '#94a3b8', marginBottom: '4px' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{cert.signer_name || 'Dr. K. R. Ramanathan'}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{cert.signer_designation || 'Dean of Academic & External Affairs'}</div>
          </div>

          {/* Seal / Emblem */}
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: '3px double #d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 4px',
                background: '#fffbeb',
                color: '#b45309'
              }}
            >
              <ShieldCheck size={32} />
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: '#78350f' }}>
              INSTITUTIONAL SEAL
            </div>
          </div>

          {/* QR & Verification ID Block */}
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>CERTIFICATE ID</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                {cert.certificate_id}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
                Issued: {cert.issue_date}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.7rem', color: isRevoked ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                {isRevoked ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                {isRevoked ? 'REVOKED' : 'CRYPTOGRAPHICALLY VERIFIED'}
              </div>
            </div>

            {/* QR Code Container */}
            {cert.qr_code_data && (
              <div
                style={{
                  padding: '4px',
                  background: '#ffffff',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                }}
              >
                <img
                  src={cert.qr_code_data.startsWith('http') ? `https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(cert.qr_code_data)}` : cert.qr_code_data}
                  alt="QR Verification"
                  style={{ width: '68px', height: '68px', display: 'block' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      {showActions && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {onDownload && (
            <button
              onClick={onDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: '0 4px 6px -1px rgba(37,99,235,0.25)'
              }}
            >
              <Download size={18} />
              Download High-Res PDF
            </button>
          )}

          {onVerify && (
            <button
              onClick={onVerify}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}
            >
              <ExternalLink size={18} />
              Open Verification Portal
            </button>
          )}
        </div>
      )}
    </div>
  );
};
