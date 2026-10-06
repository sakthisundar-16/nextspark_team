import React, { useState, useEffect } from 'react';
import { ShieldCheck, XCircle, AlertCircle, Award, Calendar, Building, User, FileText, CheckCircle2 } from 'lucide-react';

interface PublicVerifyProps {
  initialCertId?: string;
}

export const PublicCertificateVerification: React.FC<PublicVerifyProps> = ({ initialCertId }) => {
  const [certId, setCertId] = useState(initialCertId || 'EXN-2026-CSE-000184');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const fetchVerification = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`http://localhost:5000/api/public/certificates/${encodeURIComponent(idToVerify.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ valid: false, status: 'NOT_FOUND', message: 'Unable to connect to verification authority.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCertId) {
      fetchVerification(initialCertId);
    }
  }, [initialCertId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVerification(certId);
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: '#eff6ff', borderRadius: '999px', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px' }}>
          <ShieldCheck size={18} />
          EXTERNIQ Trust & Verification Registry
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          Official Credential Verification
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '0 auto' }}>
          Instantly verify the authenticity of student and faculty external achievements, hackathon prizes, and conference recognitions.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', maxWidth: '600px', margin: '0 auto 40px', background: '#ffffff', padding: '8px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', border: '1px solid #cbd5e1' }}>
        <input
          type="text"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="e.g. EXN-2026-CSE-000184"
          style={{ flex: 1, border: 'none', padding: '10px 16px', fontSize: '1rem', fontFamily: 'monospace', textTransform: 'uppercase', color: '#0f172a' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '12px 24px', background: '#2563eb', color: '#ffffff', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem' }}
        >
          {loading ? 'Verifying...' : 'Verify Record'}
        </button>
      </form>

      {/* Verification Status Banner */}
      {searched && (
        <div className="animate-fade-in">
          {result?.valid ? (
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #bbf7d0', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(16,185,129,0.1)' }}>
              {/* Green Verified Banner */}
              <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', padding: '24px 32px', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '12px' }}>
                    <CheckCircle2 size={36} color="#ffffff" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>OFFICIALLY VERIFIED CREDENTIAL</h3>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '2px' }}>
                      Cryptographic institutional accreditation active
                    </div>
                  </div>
                </div>
                <div style={{ background: '#ffffff', color: '#065f46', padding: '6px 14px', borderRadius: '999px', fontWeight: 700, fontSize: '0.85rem' }}>
                  STATUS: VALID
                </div>
              </div>

              {/* Verified Details Grid */}
              <div style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                      Participant Name
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={18} color="#2563eb" />
                      {result.certificate.issued_to_name}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                      Department
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={18} color="#64748b" />
                      {result.certificate.department_name}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                      Recognized Achievement
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={18} color="#d97706" />
                      {result.certificate.achievement}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                      Event / Activity
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      {result.certificate.event_name}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                      Organizer & Level
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#475569' }}>
                      {result.certificate.organizer_name} ({result.certificate.event_level})
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                      Issue Date & ID
                    </div>
                    <div style={{ fontSize: '0.95rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} />
                      {result.certificate.issue_date} • <code style={{ color: '#2563eb' }}>{result.certificate.certificate_id}</code>
                    </div>
                  </div>
                </div>

                {/* Outcomes list */}
                {result.certificate.outcomes && result.certificate.outcomes.length > 0 && (
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                      Accredited Institutional Outcomes
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {result.certificate.outcomes.map((out: string, idx: number) => (
                        <span key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                          ✓ {out}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : result?.status === 'REVOKED' ? (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
              <XCircle size={48} color="#ef4444" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>
                CERTIFICATE REVOKED
              </h3>
              <p style={{ color: '#b91c1c', maxWidth: '480px', margin: '0 auto' }}>
                This institutional credential ID has been officially revoked or nullified by the Academic Governance Council.
              </p>
            </div>
          ) : (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
              <AlertCircle size={48} color="#d97706" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#92400e', marginBottom: '8px' }}>
                CERTIFICATE RECORD NOT FOUND
              </h3>
              <p style={{ color: '#b45309', maxWidth: '480px', margin: '0 auto' }}>
                No active external achievement certificate found with ID "{certId}". Please double-check the unique identifier or scan the physical QR code directly.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
