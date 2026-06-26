import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';

export default function DashboardHeader({ date, stats, isMock }) {
  // Format current date nicely
  const formatDateStr = (dateStr) => {
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const d = new Date(dateStr + 'T00:00:00'); // Prevent timezone offset issues
      return d.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  const completed = stats.completed || 0;
  const total = stats.total || 0;
  const percentage = stats.percentage || 0;

  // SVG Circle calculations
  const radius = 28;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <header className="header-container">
      <div className="header-info">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          DailyDex
        </h1>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={15} style={{ color: 'var(--color-primary)' }} />
          {formatDateStr(date)}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        {isMock && (
          <div className="mock-alert" style={{ margin: 0 }}>
            <span>⚠️ Running in Offline Demo Mode (LocalStorage)</span>
          </div>
        )}
        
        <div className="header-summary-card">
          <div className="header-progress-text">
            <div className="header-progress-title">Daily Checklist</div>
            <div className="header-progress-val">
              {completed} / {total} Done ({percentage}%)
            </div>
          </div>
          
          <div className="circular-progress">
            <svg>
              <circle
                className="circular-bg"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                className="circular-fg"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                style={{
                  strokeDasharray: circumference + ' ' + circumference,
                  strokeDashoffset: strokeDashoffset
                }}
              />
            </svg>
            <div className="circular-text">{percentage}%</div>
          </div>
        </div>
      </div>
    </header>
  );
}
