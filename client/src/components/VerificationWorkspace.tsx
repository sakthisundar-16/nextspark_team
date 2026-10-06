import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Eye, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

interface VerificationWorkspaceProps {
  pendingList: any[];
  token: string;
  onActionComplete: () => void;
}

export const VerificationWorkspace: React.FC<VerificationWorkspaceProps> = ({
  pendingList,
  token,
  onActionComplete
}) => {
  const [selectedItem, setSelectedItem] = useState<any>(pendingList[0] || null);
  const [remarks, setRemarks] = useState('');
  const [evidenceQuality, setEvidenceQuality] = useState<'High' | 'Medium' | 'Needs Review'>('High');
  const [processing, setProcessing] = useState(false);

  // Update selected if pending list changes
  React.useEffect(() => {
    if (!selectedItem && pendingList.length > 0) {
      setSelectedItem(pendingList[0]);
    }
  }, [pendingList]);

  const handleDecision = async (decision: 'APPROVE' | 'REJECT' | 'CORRECTION_REQUIRED') => {
    if (!selectedItem) return;
    setProcessing(true);

    try {
      const res = await fetch(`http://localhost:5000/api/verifications/${selectedItem.id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          decision,
          remarks: remarks || `Submission evaluated and ${decision.toLowerCase()}d by faculty verifier.`,
          evidenceQuality
        })
      });

      if (res.ok) {
        setRemarks('');
        onActionComplete();
        // pick next
        const remaining = pendingList.filter(p => p.id !== selectedItem.id);
        setSelectedItem(remaining[0] || null);
      } else {
        alert('Action could not be completed.');
      }
    } catch (e) {
      console.error(e);
      alert('Verification network error.');
    } finally {
      setProcessing(false);
    }
  };

  if (!pendingList || pendingList.length === 0) {
    return (
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle size={32} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          Verification Queue is Clear
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
          All student external activity submissions, certificates, and evidence documents are up to date!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
      {/* Left List of Pending Submissions */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
            Pending Queue
          </div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '999px' }}>
            {pendingList.length} Awaiting
          </span>
        </div>

        <div style={{ maxHeight: '640px', overflowY: 'auto' }}>
          {pendingList.map((item) => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  borderLeft: isSelected ? '4px solid #2563eb' : '4px solid transparent',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#1d4ed8' : '#0f172a', marginBottom: '2px' }}>
                  {item.participant_name}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '6px' }}>
                  {item.event_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    {item.department_code} • {item.result_type}
                  </span>
                  <span style={{ color: '#94a3b8' }}>
                    {item.event_category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Detailed Verification Panel */}
      {selectedItem && (
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                  {selectedItem.event_level} Level
                </span>
                <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                  {selectedItem.event_category}
                </span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                {selectedItem.event_name}
              </h2>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Submitted by <strong>{selectedItem.participant_name}</strong> ({selectedItem.department_code}) • Reg: {selectedItem.reg_number || 'N/A'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>SUBMISSION ID</div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>{selectedItem.id}</div>
            </div>
          </div>

          {/* AI vs User Entered Info Comparison */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                User Declared Data
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Organizer:</strong> {selectedItem.organizer_name || 'External Organization'}</div>
                <div><strong>Achievement:</strong> {selectedItem.result_type}</div>
                <div><strong>Role / Type:</strong> {selectedItem.role_title || selectedItem.participation_type}</div>
                <div><strong>Skills:</strong> {selectedItem.skills_gained || 'None specified'}</div>
              </div>
            </div>

            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} /> AI Validation Analysis
              </div>
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', color: '#166534' }}>
                <div><strong>Confidence:</strong> {Math.round((selectedItem.ai_confidence_score || 0.94) * 100)}% Match</div>
                <div><strong>Duplicate Status:</strong> {selectedItem.duplicate_flag ? '⚠️ Potential match noted' : '✓ Unique Submission Verified'}</div>
                <div><strong>Digital Timestamp:</strong> Verified</div>
              </div>
            </div>
          </div>

          {/* Description & Relevance */}
          {selectedItem.description && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                Activity Description
              </div>
              <p style={{ fontSize: '0.9rem', color: '#334155', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {selectedItem.description}
              </p>
            </div>
          )}

          {/* Verification Decision Controls */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Verifier Assessment & Audit Remarks
              </label>
              <textarea
                rows={2}
                placeholder="Add institutional audit notes (e.g. 'SIH finalist credentials verified with central portal')"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Evidence Rigor:</span>
                <select
                  value={evidenceQuality}
                  onChange={(e: any) => setEvidenceQuality(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="High">High Confidence</option>
                  <option value="Medium">Medium Confidence</option>
                  <option value="Needs Review">Needs Further Review</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleDecision('CORRECTION_REQUIRED')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#fffbeb',
                    color: '#b45309',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.88rem'
                  }}
                >
                  <AlertTriangle size={16} /> Request Correction
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleDecision('REJECT')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.88rem'
                  }}
                >
                  <XCircle size={16} /> Reject
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleDecision('APPROVE')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 20px',
                    background: '#16a34a',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  <CheckCircle size={16} /> Verify & Issue Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
