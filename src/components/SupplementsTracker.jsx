import React from 'react';
import { Pill, Sun, Sunrise, Moon } from 'lucide-react';
import TiltCard from './TiltCard';

export const SUPPLEMENTS = [
  { id: 'morning_multivitamin', label: 'Multivitamin', time: 'Morning' },
  { id: 'morning_vit_d', label: 'Vitamin D', time: 'Morning' },
  { id: 'morning_biotin', label: 'Biotin', time: 'Morning' },
  { id: 'morning_b12', label: 'B12', time: 'Morning' },
  { id: 'lunch_fish_oil', label: 'Fish oil', time: 'Lunch' },
  { id: 'evening_magnesium', label: 'Magnesium', time: 'Evening' },
  { id: 'evening_zinc', label: 'Zinc', time: 'Evening' }
];

export default function SupplementsTracker({ completedSupplements, onToggleSupplement }) {
  // Group supplements by time of day
  const times = {
    Morning: { icon: <Sunrise size={14} style={{ color: 'var(--color-primary)' }} />, items: [] },
    Lunch: { icon: <Sun size={14} style={{ color: 'var(--color-primary)' }} />, items: [] },
    Evening: { icon: <Moon size={14} style={{ color: 'var(--color-secondary)' }} />, items: [] }
  };

  SUPPLEMENTS.forEach(supp => {
    if (times[supp.time]) {
      times[supp.time].items.push(supp);
    }
  });

  return (
    <TiltCard className="glow-success" glowColor="rgba(20, 184, 166, 0.12)">
      <h2 className="section-title">
        <Pill size={18} />
        Supplements Tracker
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Object.entries(times).map(([timeLabel, group]) => {
          if (group.items.length === 0) return null;
          
          return (
            <div key={timeLabel} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {/* Header for Time Block */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                fontSize: '0.8rem', 
                fontWeight: 600, 
                color: 'var(--color-text-muted)',
                marginBottom: '0.15rem'
              }}>
                {group.icon}
                {timeLabel}
              </div>

              {/* Capsule Grid */}
              <div className="supplements-grid">
                {group.items.map(supp => {
                  const isChecked = completedSupplements.includes(supp.id);
                  return (
                    <label 
                      key={supp.id} 
                      className={`supp-capsule ${isChecked ? 'is-checked' : ''}`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={(e) => onToggleSupplement(supp.id, e.target.checked)}
                      />
                      <span className="supp-capsule-icon"></span>
                      <span>{supp.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </TiltCard>
  );
}
