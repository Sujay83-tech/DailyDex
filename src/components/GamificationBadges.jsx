import React from 'react';
import { Award, Flame, Star, Shield, Crown } from 'lucide-react';

const BADGES = [
  { id: 'streak_7', label: '7-Day Streak', icon: Flame, requirement: 7, color: '#f97316' },
  { id: 'streak_14', label: '2 Weeks Strong', icon: Shield, requirement: 14, color: '#f59e0b' },
  { id: 'streak_30', label: 'Monthly Warrior', icon: Star, requirement: 30, color: '#eab308' },
  { id: 'streak_60', label: '60-Day Legend', icon: Crown, requirement: 60, color: '#fbbf24' },
  { id: 'streak_100', label: 'Century Club', icon: Award, requirement: 100, color: '#fef08a' },
];

export default function GamificationBadges({ streak }) {
  const earned = BADGES.filter(b => streak >= b.requirement);
  const upcoming = BADGES.filter(b => streak < b.requirement);

  if (earned.length === 0 && upcoming.length === 0) return null;

  return (
    <div className="badges-section">
      {earned.length > 0 && (
        <>
          <div className="badges-title" style={{ color: 'var(--color-primary)' }}>
            <Award size={14} /> Badges Earned
          </div>
          <div className="badges-row">
            {earned.map(badge => (
              <div key={badge.id} className="badge earned" style={{ borderColor: `${badge.color}44`, background: `${badge.color}11` }}>
                <badge.icon size={16} style={{ color: badge.color }} />
                <span className="badge-label">{badge.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {upcoming.length > 0 && earned.length > 0 && (
        <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.5rem 0' }} />
      )}

      {upcoming.length > 0 && (
        <>
          <div className="badges-title" style={{ color: 'var(--color-text-muted)' }}>
            <Award size={14} /> Next Milestones
          </div>
          <div className="badges-row">
            {upcoming.map(badge => (
              <div key={badge.id} className="badge locked" style={{ borderColor: 'var(--color-border)' }}>
                <badge.icon size={14} style={{ color: 'var(--color-text-dim)' }} />
                <span className="badge-label">{badge.label}</span>
                <span className="badge-progress">{streak}/{badge.requirement}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
