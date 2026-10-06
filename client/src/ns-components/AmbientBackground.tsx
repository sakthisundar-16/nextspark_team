import React from 'react';
import { UserRole } from '../ns-types';

interface AmbientBackgroundProps {
  role?: UserRole | 'public';
}

export function AmbientBackground({ role = 'public' }: AmbientBackgroundProps) {
  return (
    <div className={`ambient-bg-wrapper role-${role}`} aria-hidden="true">
      {/* Dynamic Animated Mesh Gradients */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />
      <div className="ambient-blob blob-3" />

      {/* Role Metaphor Layer (Fine Grid / Tech Data Lines) */}
      <div className="ambient-grid-overlay" />

      {/* Light Scan Beam */}
      <div className="ambient-scan-beam" />

      {/* Subtle Noise Texture Grain */}
      <div className="ambient-noise" />
    </div>
  );
}
