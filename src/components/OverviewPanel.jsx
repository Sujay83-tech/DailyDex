import React from 'react';
import { Clock, PieChart, Activity } from 'lucide-react';
import TiltCard from './TiltCard';

const PLAN = [
  { id: 'sleep', label: 'Sleep', hours: 7.0, colorClass: 'color-sleep', hexColor: '#3b82f6' },
  { id: 'gym', label: 'Gym', hours: 0.8, colorClass: 'color-gym', hexColor: '#f5a524' },
  { id: 'cooking', label: 'Cooking', hours: 1.5, colorClass: 'color-cooking', hexColor: '#ec4899' }, // Morning + Evening
  { id: 'office', label: 'Office work', hours: 6.0, colorClass: 'color-office', hexColor: '#a78bfa' },
  { id: 'self_care', label: 'Self-care', hours: 1.0, colorClass: 'color-selfcare', hexColor: '#14b8a6' },
  { id: 'reading', label: 'Reading/study', hours: 3.0, colorClass: 'color-reading', hexColor: '#10b981' }, // Session 1 + 2
  { id: 'devotional', label: 'Devotional', hours: 0.75, colorClass: 'color-devotional', hexColor: '#f43f5e' },
  { id: 'leisure', label: 'Leisure & Buffer', hours: 3.95, colorClass: 'color-leisure', hexColor: '#6b7280' },
];

export default function OverviewPanel({ completedHours }) {
  const totalHours = 24;
  const remainingHours = Math.max(0, totalHours - completedHours);
  const completionPercentage = Math.round((completedHours / totalHours) * 100);

  return (
    <TiltCard className="glow-primary" glowColor="rgba(245, 165, 36, 0.12)">
      <h2 className="section-title">
        <Clock size={18} />
        24-Hour Day Allocation & Live Tracker
      </h2>

      {/* Static Planned Allocation Bar */}
      <div className="stacked-bar-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <PieChart size={14} style={{ color: 'var(--color-primary)' }} />
            Planned Day Breakdown (24h)
          </span>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>24.0 Hours Total</span>
        </div>
        
        <div className="stacked-bar">
          {PLAN.map((segment) => {
            const widthPct = (segment.hours / totalHours) * 100;
            return (
              <div
                key={segment.id}
                className={`stacked-segment ${segment.colorClass}`}
                style={{ width: `${widthPct}%` }}
                title={`${segment.label}: ${segment.hours} hrs (${Math.round(widthPct)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="stacked-legend">
          {PLAN.map((segment) => (
            <div key={segment.id} className="legend-item">
              <span className={`legend-color ${segment.colorClass}`} />
              <span>{segment.label} ({segment.hours}h)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-border)', margin: '1.25rem 0' }} />

      {/* Live Tracker progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Activity size={14} style={{ color: 'var(--color-success)' }} />
              Live "Time Used Today"
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.15rem' }}>
              {completedHours.toFixed(2)} / 24 hours logged
            </span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
            <strong>{remainingHours.toFixed(2)} hrs</strong> unaccounted / remaining
          </span>
        </div>

        {/* Progress Bar */}
        <div className="progress-track">
          <div
            className={`progress-fill ${completedHours >= 24 ? 'success' : ''}`}
            style={{ width: `${Math.min(100, completionPercentage)}%` }}
          />
        </div>

        {/* Motivation note */}
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
          {completionPercentage === 0 && "Start ticking off habits to account for your day!"}
          {completionPercentage > 0 && completionPercentage < 50 && "Good start. Keep going, step by step!"}
          {completionPercentage >= 50 && completionPercentage < 80 && "Over halfway there! Stay disciplined."}
          {completionPercentage >= 80 && completionPercentage < 100 && "Excellent day so far! Finishing strong."}
          {completionPercentage >= 100 && "Boom! 100% of your planned time accounted for. Outstanding discipline!"}
        </p>
      </div>
    </TiltCard>
  );
}
