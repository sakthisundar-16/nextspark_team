import React, { useState } from 'react';
import { Upload, Sparkles, CheckCircle, AlertTriangle, FileText, ArrowRight, RefreshCw } from 'lucide-react';

interface AddActivityProps {
  onSuccess: () => void;
  onCancel: () => void;
  token: string;
}

export const AddActivityModal: React.FC<AddActivityProps> = ({ onSuccess, onCancel, token }) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Upload & AI Extract, 2: Review & Submit
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    eventName: '',
    organizer: '',
    eventType: 'Hackathon',
    eventLevel: 'National',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    mode: 'Offline',
    venue: '',
    participationType: 'Team Lead',
    teamName: '',
    roleTitle: '',
    resultType: 'Winner',
    description: '',
    skillsGained: '',
    outcomes: ['Skill Development', 'Innovation'],
    relevance: ''
  });

  // AI & Duplicate states
  const [confidence, setConfidence] = useState<any>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);

  const availableOutcomes = [
    'Skill Development',
    'Innovation',
    'Research',
    'Publication',
    'Industry Exposure',
    'Entrepreneurship',
    'Leadership',
    'Academic Recognition'
  ];

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setAnalyzing(true);
    setAnalysisStep('Reading document headers & seals...');

    const payload = new FormData();
    payload.append('file', uploadedFile);

    try {
      setTimeout(() => setAnalysisStep('Extracting participant & organizer details...'), 500);
      setTimeout(() => setAnalysisStep('Calculating institutional confidence scores...'), 1100);

      const res = await fetch('http://localhost:5000/api/ai/extract-certificate', {
        method: 'POST',
        body: payload
      });
      const data = await res.json();

      if (data.extraction) {
        setFormData(prev => ({
          ...prev,
          eventName: data.extraction.eventName || prev.eventName,
          organizer: data.extraction.organizer || prev.organizer,
          eventType: data.extraction.eventType || prev.eventType,
          eventLevel: data.extraction.eventLevel || prev.eventLevel,
          resultType: data.extraction.achievement || prev.resultType,
          startDate: data.extraction.eventDate || prev.startDate,
          endDate: data.extraction.eventDate || prev.endDate
        }));
        setConfidence(data.extraction.confidenceScores);
      }

      if (data.duplicateCheck && data.duplicateCheck.isDuplicate) {
        setDuplicateWarning(data.duplicateCheck);
      } else {
        setDuplicateWarning(null);
      }

      setStep(2);
    } catch (err) {
      console.error(err);
      setStep(2);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleOutcome = (outcome: string) => {
    setFormData(prev => ({
      ...prev,
      outcomes: prev.outcomes.includes(outcome)
        ? prev.outcomes.filter(o => o !== outcome)
        : [...prev.outcomes, outcome]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'outcomes') {
          data.append(k, JSON.stringify(v));
        } else {
          data.append(k, v as string);
        }
      });

      if (file) {
        data.append('evidence', file);
      }
      if (confidence) {
        data.append('aiConfidenceScore', String(confidence.overall || 0.92));
      }
      if (duplicateWarning) {
        data.append('duplicateFlag', '1');
        data.append('duplicateDetails', duplicateWarning.reason || 'High similarity detected');
      }

      const res = await fetch('http://localhost:5000/api/participations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      if (res.ok) {
        onSuccess();
      } else {
        alert('Failed to submit external participation. Please check all fields.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to institutional backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Add External Activity
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
              AI-assisted evidence parsing & verification submission
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{ padding: '6px 12px', borderRadius: '6px', color: '#64748b', fontSize: '1.2rem', fontWeight: 600 }}
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {step === 1 ? (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#eff6ff', borderRadius: '999px', color: '#2563eb', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                  <Sparkles size={16} /> Step 1: Upload Certificate or Evidence
                </div>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  Upload a PDF or image certificate. EXTERNIQ AI will automatically analyze participant details and detect duplicate records.
                </p>
              </div>

              {/* Upload Dropzone */}
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '48px 20px',
                  border: '2px dashed #93c5fd',
                  borderRadius: '16px',
                  backgroundColor: '#f8fafc',
                  cursor: analyzing ? 'wait' : 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
              >
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  disabled={analyzing}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  style={{ display: 'none' }}
                />

                {analyzing ? (
                  <div>
                    <RefreshCw size={36} color="#2563eb" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem', marginBottom: '4px' }}>
                      AI Certificate Intelligence Active
                    </div>
                    <div style={{ color: '#2563eb', fontSize: '0.9rem' }}>{analysisStep}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#2563eb' }}>
                      <Upload size={28} />
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', marginBottom: '4px' }}>
                      Click to browse or drop certificate file
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Supports PDF, PNG, JPG (up to 15MB)
                    </div>
                  </div>
                )}
              </label>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'underline' }}
                >
                  Skip upload and enter details manually →
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* AI Extraction Confidence Banner */}
              {confidence && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: 700, fontSize: '0.9rem' }}>
                      <Sparkles size={16} /> AI Extracted Information (Editable)
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '999px' }}>
                      {Math.round((confidence.overall || 0.94) * 100)}% Confidence
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#166534' }}>
                    <span>Event Name: <strong>{Math.round(confidence.eventName * 100)}%</strong></span>
                    <span>Organizer: <strong>{Math.round(confidence.organizer * 100)}%</strong></span>
                    <span>Achievement: <strong>{Math.round(confidence.achievement * 100)}%</strong></span>
                  </div>
                </div>
              )}

              {/* Duplicate Detection Warning */}
              {duplicateWarning && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                    <AlertTriangle size={16} /> Possible Duplicate Detected
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#b45309' }}>
                    {duplicateWarning.reason} (Submission allowed for mentor review).
                  </div>
                </div>
              )}

              {/* Input Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Host / Organizer *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Event Category
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option>Hackathon</option>
                    <option>Conference</option>
                    <option>Workshop</option>
                    <option>Competition</option>
                    <option>Paper Presentation</option>
                    <option>Project Expo</option>
                    <option>FDP</option>
                    <option>Internship</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Event Level
                  </label>
                  <select
                    value={formData.eventLevel}
                    onChange={(e) => setFormData({ ...formData, eventLevel: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option>Department</option>
                    <option>College</option>
                    <option>State</option>
                    <option>National</option>
                    <option>International</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Result / Achievement
                  </label>
                  <select
                    value={formData.resultType}
                    onChange={(e) => setFormData({ ...formData, resultType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option>Winner</option>
                    <option>Runner-up</option>
                    <option>Finalist</option>
                    <option>Best Paper</option>
                    <option>Certificate of Excellence</option>
                    <option>Participation</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    Participation Type
                  </label>
                  <select
                    value={formData.participationType}
                    onChange={(e) => setFormData({ ...formData, participationType: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option>Individual</option>
                    <option>Team Lead</option>
                    <option>Team Member</option>
                    <option>Presenter</option>
                  </select>
                </div>
              </div>

              {/* Skills gained */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Skills Gained (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PyTorch, React, Cloud Computing, Edge AI"
                  value={formData.skillsGained}
                  onChange={(e) => setFormData({ ...formData, skillsGained: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {/* Institutional Outcomes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Institutional Outcomes Tagged (Multiple selection)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {availableOutcomes.map((out) => {
                    const active = formData.outcomes.includes(out);
                    return (
                      <button
                        type="button"
                        key={out}
                        onClick={() => toggleOutcome(out)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          backgroundColor: active ? '#2563eb' : '#f1f5f9',
                          color: active ? '#ffffff' : '#475569',
                          border: active ? '1px solid #2563eb' : '1px solid #cbd5e1'
                        }}
                      >
                        {active ? '✓ ' : '+ '} {out}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600 }}
                >
                  ← Back to Upload
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 20px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff', fontWeight: 600, boxShadow: '0 2px 4px rgba(37,99,235,0.2)' }}
                >
                  {submitting ? 'Submitting to Verification Queue...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
