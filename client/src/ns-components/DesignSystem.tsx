import React from 'react';

export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line" style={{ height: 120, borderRadius: 12, marginBottom: 16 }} />
      <div className="skeleton-line" style={{ width: '40%', height: 16, marginBottom: 12 }} />
      <div className="skeleton-line" style={{ width: '85%', height: 22, marginBottom: 12 }} />
      <div className="skeleton-line" style={{ width: '60%', height: 14 }} />
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="skeleton-table">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton-line" style={{ width: '25%', height: 18 }} />
          <div className="skeleton-line" style={{ width: '35%', height: 18 }} />
          <div className="skeleton-line" style={{ width: '20%', height: 18 }} />
          <div className="skeleton-line" style={{ width: '10%', height: 18 }} />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  icon = '✨',
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-brand-primary empty-state-btn">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
