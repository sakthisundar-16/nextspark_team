import React from 'react';
import { NSNotification } from '../ns-types';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  notifications: NSNotification[];
  token: string;
  onClose: () => void;
  onRead: () => void;
  onNavigate: (link?: string) => void;
}

const API = 'http://localhost:5001/api2';

export function NSNotificationsPanel({ notifications, token, onClose, onRead, onNavigate }: Props) {
  const handleMarkAllRead = async () => {
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      onRead();
    } catch {}
  };

  const handleItemClick = async (notif: NSNotification) => {
    if (!notif.is_read) {
      try {
        await fetch(`${API}/notifications/${notif.id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
        onRead();
      } catch {}
    }
    if (notif.link) {
      onNavigate(notif.link);
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 48,
        right: 0,
        width: 360,
        maxWidth: '90vw',
        background: '#131322',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        zIndex: 500,
        overflow: 'hidden',
        backdropFilter: 'blur(16px)'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={16} color="#a5b4fc" />
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>Notifications</span>
          {notifications.filter(n => !n.is_read).length > 0 && (
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: 999,
                background: '#ef4444',
                color: '#fff'
              }}
            >
              {notifications.filter(n => !n.is_read).length} new
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleMarkAllRead}
            title="Mark all as read"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <Check size={14} /> Read all
          </button>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
            <Bell size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p style={{ margin: 0, fontSize: '0.85rem' }}>No notifications yet</p>
          </div>
        ) : (
          notifications.map(n => {
            const isUnread = !n.is_read;
            const Icon = n.type === 'success' ? CheckCircle2 : n.type === 'warning' ? AlertTriangle : Info;
            const iconColor = n.type === 'success' ? '#34d399' : n.type === 'warning' ? '#fbbf24' : '#60a5fa';

            return (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: isUnread ? 'rgba(99,102,241,0.06)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  transition: 'background 0.15s ease'
                }}
              >
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <Icon size={16} color={iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: isUnread ? 700 : 600, color: '#f1f5f9' }}>
                      {n.title}
                    </span>
                    {isUnread && (
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {n.link && (
                      <span style={{ fontSize: '0.72rem', color: '#a5b4fc', display: 'flex', alignItems: 'center', gap: 2 }}>
                        View <ArrowRight size={11} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
