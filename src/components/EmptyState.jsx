import React from 'react';
import { Sparkles } from 'lucide-react';

const VARIANTS = {
  habits: {
    icon: Sparkles,
    title: 'Start Your Day',
    message: 'Toggle a habit above to begin tracking. Every small win counts!',
  },
  history: {
    icon: Sparkles,
    title: 'No History Yet',
    message: 'Complete some habits — your progress log will appear here.',
  },
  heatmap: {
    icon: Sparkles,
    title: 'No Data Yet',
    message: 'Start tracking to see your 28-day habit heatmap.',
  },
  chart: {
    icon: Sparkles,
    title: 'Not Enough Data',
    message: 'Track for a few days to see your trend charts.',
  },
};

export default function EmptyState({ variant = 'habits', compact = false }) {
  const v = VARIANTS[variant] || VARIANTS.habits;

  if (compact) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '1rem',
        fontSize: '0.8rem',
        color: 'var(--color-text-muted)',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        border: '1px dashed var(--color-border)',
      }}>
        <v.icon size={14} style={{ display: 'inline', marginBottom: '-2px', color: 'var(--color-primary)' }} /> {v.message}
      </div>
    );
  }

  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ background: 'rgba(245, 165, 36, 0.08)', color: 'var(--color-primary)' }}>
        <v.icon size={24} />
      </div>
      <div className="empty-state-title">{v.title}</div>
      <div className="empty-state-message">{v.message}</div>
    </div>
  );
}
