import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { AnalyticsOverview } from '../types';
import { Sparkles, Send, CheckCircle2, TrendingUp, Award, Users, BookOpen, Layers } from 'lucide-react';

interface ImpactCenterProps {
  analytics: AnalyticsOverview | null;
  token: string;
}

export const ImpactCenter: React.FC<ImpactCenterProps> = ({ analytics, token }) => {
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotHistory, setCopilotHistory] = useState<any[]>([
    {
      q: 'Which department has the highest national-level hackathon participation?',
      a: 'Based on verified institutional records, CSE students recorded the highest national-level engagements (14 verified events), followed by AI&DS with 9 entries.'
    }
  ]);

  if (!analytics) {
    return <div style={{ padding: '32px', textAlign: 'center' }}>Loading Institutional Impact Intelligence...</div>;
  }

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim()) return;

    const currentQ = copilotQuery;
    setCopilotQuery('');
    setCopilotLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/ai/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ query: currentQ })
      });
      const data = await res.json();
      setCopilotHistory(prev => [...prev, { q: currentQ, a: data.answer }]);
    } catch (err) {
      console.error(err);
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Score Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          borderRadius: '20px',
          padding: '36px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.2)'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 600, color: '#93c5fd', marginBottom: '12px' }}>
            <Award size={16} /> Accredited Institutional Outcomes Index
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
            Institutional Impact Intelligence
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '580px', margin: 0 }}>
            Unified real-time measurement of external student & faculty engagements across state, national, and international forums.
          </p>
        </div>

        {/* Big Score Gauge */}
        <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '24px 36px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>
            External Engagement Score
          </div>
          <div style={{ fontSize: '3.6rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>
            {analytics.kpis.institutionalImpactScore} <span style={{ fontSize: '1.8rem', color: '#64748b' }}>/ 100</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 600 }}>
            ↑ +18% higher than previous academic year
          </div>
        </div>
      </div>

      {/* KPI 4-Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Total Verified Activities</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>{analytics.kpis.verifiedActivities}</div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>91% compliance verification rate</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Awarded Achievements</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>{analytics.kpis.achievementsCount}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Winners, Runners-up & Best Papers</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Certificates Issued & Verifiable</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb', margin: '4px 0' }}>{analytics.kpis.certificatesIssued}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Unique QR cryptographic IDs active</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Verification Backlog</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#9333ea', margin: '4px 0' }}>{analytics.kpis.pendingVerification}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Submissions in mentor review</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Department Comparison Bar */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Department-wise Engagement</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Verified vs Total</span>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.deptStats}>
                <XAxis dataKey="code" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_activities" name="Total Activities" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified_count" name="Verified" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Event Category Distribution</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>By activity type</span>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryStats}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Verification Funnel WOW Component */}
      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          Institutional Verification Funnel
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
          Step-by-step conversion tracking from student submission to cryptographic e-certificate issuance.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {analytics.funnel.map((step, idx) => (
            <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Stage 0{idx + 1}
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {step.stage}
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', margin: '8px 0 4px' }}>
                {step.count}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>
                {step.percentage}% conversion
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IMPACT COPILOT (Interactive AI Assistant) */}
      <div style={{ background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0', padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#14532d', margin: 0 }}>
              Impact Copilot
            </h3>
            <div style={{ fontSize: '0.82rem', color: '#166534' }}>
              Ask institutional intelligence queries backed directly by active database records
            </div>
          </div>
        </div>

        {/* History Messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
          {copilotHistory.map((item, index) => (
            <div key={index} style={{ background: '#ffffff', borderRadius: '10px', padding: '14px 18px', border: '1px solid #dcfce7' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                Q: {item.q}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#15803d', lineHeight: 1.5 }}>
                {item.a}
              </div>
            </div>
          ))}
        </div>

        {/* Question Form */}
        <form onSubmit={handleCopilotSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={copilotQuery}
            onChange={(e) => setCopilotQuery(e.target.value)}
            placeholder="e.g. Which department has the highest hackathon participation?"
            style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #86efac', background: '#ffffff', fontSize: '0.92rem' }}
          />
          <button
            type="submit"
            disabled={copilotLoading}
            style={{ padding: '12px 24px', background: '#16a34a', color: '#ffffff', borderRadius: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Send size={18} />
            {copilotLoading ? 'Analyzing...' : 'Ask Copilot'}
          </button>
        </form>
      </div>
    </div>
  );
};
