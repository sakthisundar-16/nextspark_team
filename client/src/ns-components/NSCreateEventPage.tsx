import React, { useState, useEffect } from 'react';
import { NSUser, NSCollege } from '../ns-types';
import {
  Plus, X, Calendar, MapPin, Globe, Sparkles, AlertCircle, CheckCircle2,
  Image, Upload, Trophy, Shield, Users, Eye, Check, ChevronRight
} from 'lucide-react';
import { useToast } from './ToastContext';

const API = 'http://localhost:5001/api2';

interface Props {
  token: string;
  currentUser: NSUser | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Curated high-resolution competition banner presets
const CURATED_EVENT_IMAGES = [
  {
    label: 'Hackathon & Coding',
    category: 'Technical',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'AI & Machine Learning',
    category: 'Technical',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Robotics & Hardware',
    category: 'Technical',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Paper & Tech Symposium',
    category: 'Technical',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Cultural & Music Fest',
    category: 'Cultural',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Sports Tournament',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Business Case & Pitch',
    category: 'Management',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Debate & Literary',
    category: 'Literary',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
  },
];

export function NSCreateEventPage({ token, currentUser, onSuccess, onCancel }: Props) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [colleges, setColleges] = useState<NSCollege[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technical');
  const [eventType, setEventType] = useState('Inter-College');
  const [collegeId, setCollegeId] = useState(currentUser?.college_id || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [regDeadline, setRegDeadline] = useState('');
  const [venue, setVenue] = useState('Campus Tech Complex & Main Auditorium');
  const [mode, setMode] = useState('Offline');
  const [maxParticipants, setMaxParticipants] = useState(120);
  const [teamSizeMin, setTeamSizeMin] = useState(1);
  const [teamSizeMax, setTeamSizeMax] = useState(4);
  const [prizePool, setPrizePool] = useState('₹35,000');
  const [firstPrize, setFirstPrize] = useState('₹20,000');
  const [secondPrize, setSecondPrize] = useState('₹10,000');
  const [thirdPrize, setThirdPrize] = useState('₹5,000');
  const [rules, setRules] = useState('1. Valid college ID card mandatory.\n2. Original implementation / prototype required.\n3. Coordinator score evaluation is final.');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'events@college.edu');
  const [contactPhone, setContactPhone] = useState('+91 98765 43210');

  // Image states: either a curated preset or a custom URL / uploaded file
  const [selectedImage, setSelectedImage] = useState<string>(CURATED_EVENT_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [imageMode, setImageMode] = useState<'presets' | 'custom'>('presets');

  // Default certificate template setting
  const [certTheme, setCertTheme] = useState<'gold' | 'cyber' | 'royal' | 'minimal'>('gold');

  useEffect(() => {
    fetch(`${API}/colleges`)
      .then(r => r.json())
      .then(d => {
        setColleges(d);
        if (!collegeId && d.length > 0) {
          setCollegeId(currentUser?.college_id || d[0].id);
        }
      })
      .catch(() => {});
  }, [collegeId, currentUser]);

  // Handle local image file upload preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedImage(reader.result);
        setImageMode('custom');
        setCustomImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const finalImage = imageMode === 'custom' && customImageUrl.trim() ? customImageUrl : selectedImage;

    try {
      const payload = {
        title,
        description,
        category,
        event_type: eventType,
        college_id: collegeId,
        start_date: startDate || new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16),
        end_date: endDate || new Date(Date.now() + 86400000 * 8).toISOString().slice(0, 16),
        registration_deadline: regDeadline || new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 16),
        venue,
        mode,
        max_participants: Number(maxParticipants),
        team_size_min: Number(teamSizeMin),
        team_size_max: Number(teamSizeMax),
        prize_pool: prizePool,
        first_prize: firstPrize,
        second_prize: secondPrize,
        third_prize: thirdPrize,
        image_url: finalImage,
        banner_gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        certificate_template: JSON.stringify({
          theme: certTheme,
          certificateTitle: 'Certificate of Merit & Achievement',
          orgSubtitle: 'Inter-College Engineering Consortium',
          issuedBy: currentUser?.name || 'Event Operations Head',
          borderColor: certTheme === 'cyber' ? '#06b6d4' : certTheme === 'royal' ? '#6366f1' : '#d97706',
        }),
        status: 'Open',
        rules,
        contact_email: contactEmail,
        contact_phone: contactPhone,
      };

      const res = await fetch(`${API}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create event');
      }

      toastSuccess('Event Published Successfully 🚀', `"${title}" is now open for students across colleges!`);
      setTimeout(() => {
        onSuccess();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Error publishing event');
      toastError(err.message || 'Error publishing event');
    } finally {
      setLoading(false);
    }
  };

  const activeImagePreview = imageMode === 'custom' && customImageUrl.trim() ? customImageUrl : selectedImage;

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 60, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── HEADER ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: '#eff6ff', color: '#2563eb', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: 8 }}>
            <Sparkles size={13} /> Event Host Studio
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Publish Inter-College Competition 🚀
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Upload authentic banner imagery, set registration limits, schedule timelines, and prepare automated e-certificates.
          </p>
        </div>

        <button
          onClick={onCancel}
          style={{
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            color: '#475569',
            borderRadius: 8,
            padding: '9px 16px',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 18px', borderRadius: 10, color: '#dc2626', marginBottom: 20, fontSize: '0.88rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ── SECTION 1: BANNER IMAGE SELECTION & UPLOAD (HIGH VISIBILITY) ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Image size={18} color="#2563eb" /> 1. Event Poster & Banner Imagery *
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                High-quality visual posters attract top engineers. Choose from curated competition themes or upload your college poster.
              </p>
            </div>

            <div style={{ display: 'flex', background: '#f1f5f9', padding: 3, borderRadius: 8 }}>
              <button
                type="button"
                onClick={() => setImageMode('presets')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: imageMode === 'presets' ? 800 : 600,
                  background: imageMode === 'presets' ? '#ffffff' : 'transparent',
                  color: imageMode === 'presets' ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: imageMode === 'presets' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                Curated Posters
              </button>
              <button
                type="button"
                onClick={() => setImageMode('custom')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: imageMode === 'custom' ? 800 : 600,
                  background: imageMode === 'custom' ? '#ffffff' : 'transparent',
                  color: imageMode === 'custom' ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: imageMode === 'custom' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                Custom URL / Upload
              </button>
            </div>
          </div>

          {/* Live Large Banner Preview */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 220,
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 16,
              border: '2px solid #e2e8f0',
              background: '#0f172a',
            }}
          >
            <img
              src={activeImagePreview}
              alt="Event banner preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '20px 24px',
              }}
            >
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Poster Live Preview
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                {title || 'Your Event Title Will Appear Here'}
              </h3>
            </div>
          </div>

          {/* Mode 1: Curated Thumbnails Grid */}
          {imageMode === 'presets' && (
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginBottom: 10 }}>
                Click to select a themed event poster:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: 10 }}>
                {CURATED_EVENT_IMAGES.map((img, idx) => {
                  const isSelected = selectedImage === img.url;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedImage(img.url)}
                      style={{
                        position: 'relative',
                        height: 75,
                        borderRadius: 8,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: isSelected ? '3px solid #2563eb' : '1px solid #e2e8f0',
                        boxShadow: isSelected ? '0 4px 10px rgba(37,99,235,0.25)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <img src={img.url} alt={img.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', bottom: 0, insetInline: 0, background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '2px 4px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {img.label}
                      </div>
                      {isSelected && (
                        <div style={{ position: 'absolute', top: 4, right: 4, background: '#2563eb', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mode 2: Custom URL / Local File Upload */}
          {imageMode === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Direct Image URL (JPG / PNG / WebP)
                </label>
                <input
                  type="url"
                  value={customImageUrl}
                  onChange={e => setCustomImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or college cloud image link"
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '10px 14px',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Or Upload From Device
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '14px',
                    background: '#f8fafc',
                    border: '2px dashed #cbd5e1',
                    borderRadius: 8,
                    cursor: 'pointer',
                    color: '#2563eb',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  <Upload size={16} /> Choose Image File (Poster / Flyer)
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 2: OVERVIEW & BASIC METADATA ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>2.</span> Event Details & Scope
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. National HackForge 2026 or Inter-College RoboWars"
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '11px 14px',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="Technical">Technical & Coding</option>
                  <option value="Cultural">Cultural & Arts</option>
                  <option value="Sports">Sports & Athletics</option>
                  <option value="Management">Management & Case Study</option>
                  <option value="Literary">Literary & Debate</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Competition Scope
                </label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="Inter-College">Inter-College (All Institutions)</option>
                  <option value="Intra-College">Intra-College (Internal Only)</option>
                  <option value="National">National Level</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Host College
                </label>
                <select
                  value={collegeId}
                  onChange={e => setCollegeId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: '#0f172a',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                >
                  {colleges.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Event Summary & Problem Statements
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the challenges, hackathon tracks, judging expectations, and perks..."
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '10px 14px',
                  color: '#0f172a',
                  fontSize: '0.88rem',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── SECTION 3: SCHEDULE, VENUE & TEAM SIZES ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>3.</span> Schedule, Logistics & Capacity
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Start Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px', color: '#0f172a', fontSize: '0.86rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                End Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px', color: '#0f172a', fontSize: '0.86rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Registration Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={regDeadline}
                onChange={e => setRegDeadline(e.target.value)}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px', color: '#0f172a', fontSize: '0.86rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Delivery Mode
              </label>
              <select
                value={mode}
                onChange={e => setMode(e.target.value)}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px', color: '#0f172a', fontSize: '0.88rem' }}
              >
                <option value="Offline">Offline (Campus)</option>
                <option value="Online">Online (Virtual)</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Venue / Online Platform URL *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={e => setVenue(e.target.value)}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px', color: '#0f172a', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Max Participant Limit
              </label>
              <input
                type="number"
                value={maxParticipants}
                onChange={e => setMaxParticipants(Number(e.target.value))}
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 12px', color: '#0f172a', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Team Size (Min - Max)
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="number"
                  min={1}
                  value={teamSizeMin}
                  onChange={e => setTeamSizeMin(Number(e.target.value))}
                  style={{ width: '50%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 8px', color: '#0f172a', textAlign: 'center', fontWeight: 700 }}
                />
                <input
                  type="number"
                  min={1}
                  value={teamSizeMax}
                  onChange={e => setTeamSizeMax(Number(e.target.value))}
                  style={{ width: '50%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 8px', color: '#0f172a', textAlign: 'center', fontWeight: 700 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: PRIZES & CERTIFICATE STYLING ── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            padding: 24,
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          }}
        >
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>4.</span> Prizes & Automated Certificate Theme
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: 4 }}>Total Prize Pool</label>
              <input type="text" value={prizePool} onChange={e => setPrizePool(e.target.value)} style={{ width: '100%', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '9px 12px', color: '#b45309', fontWeight: 800 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: 4 }}>1st Place Prize</label>
              <input type="text" value={firstPrize} onChange={e => setFirstPrize(e.target.value)} style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', color: '#0f172a', fontWeight: 700 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: 4 }}>2nd Place Prize</label>
              <input type="text" value={secondPrize} onChange={e => setSecondPrize(e.target.value)} style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', color: '#0f172a', fontWeight: 700 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#475569', fontWeight: 700, marginBottom: 4 }}>3rd Place Prize</label>
              <input type="text" value={thirdPrize} onChange={e => setThirdPrize(e.target.value)} style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '9px 12px', color: '#0f172a', fontWeight: 700 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 8 }}>
              Default Certificate Template Theme (Auto-Issued on Completion)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {[
                { key: 'gold', label: 'Gold Classic', border: '#d97706', desc: 'Prestige gold seal border' },
                { key: 'cyber', label: 'Tech Cyan', border: '#06b6d4', desc: 'Futuristic engineering look' },
                { key: 'royal', label: 'Royal Indigo', border: '#6366f1', desc: 'Institutional academic crest' },
                { key: 'minimal', label: 'Minimalist Slate', border: '#334155', desc: 'Clean corporate design' },
              ].map(t => (
                <div
                  key={t.key}
                  onClick={() => setCertTheme(t.key as any)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: certTheme === t.key ? `2px solid ${t.border}` : '1px solid #e2e8f0',
                    background: certTheme === t.key ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: t.border }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a' }}>{t.label}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SUBMIT BAR ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 4 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn-brand-primary"
            style={{
              padding: '12px 32px',
              fontSize: '0.96rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {loading ? 'Publishing Event...' : '🚀 Publish Event & Open Registrations'}
          </button>
        </div>
      </form>
    </div>
  );
}
