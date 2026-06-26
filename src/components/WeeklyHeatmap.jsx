import React from 'react';
import TiltCard from './TiltCard';
import { Calendar } from 'lucide-react';

function getDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function WeeklyHeatmap({ dailyHistory, currentDateStr }) {
  const today = new Date(currentDateStr + 'T00:00:00');

  const historyMap = {};
  dailyHistory.forEach(r => { historyMap[r.date] = r; });

  const mandatoryIds = ['sleep', 'gym', 'cooking_morning', 'cooking_evening', 'office', 'self_care', 'reading_1', 'reading_2'];

  const getCompletionPct = (dateStr) => {
    const record = historyMap[dateStr];
    if (!record) return 0;
    const tasks = record.completed_tasks || [];
    let count = 0;
    mandatoryIds.forEach(id => { if (tasks.includes(id)) count++; });
    return Math.round((count / mandatoryIds.length) * 100);
  };

  const getColor = (pct) => {
    if (pct === 0) return 'var(--color-border)';
    if (pct < 25) return 'rgba(20, 184, 166, 0.15)';
    if (pct < 50) return 'rgba(20, 184, 166, 0.35)';
    if (pct < 75) return 'rgba(20, 184, 166, 0.55)';
    if (pct < 100) return 'rgba(20, 184, 166, 0.75)';
    return 'var(--color-success)';
  };

  const weeks = [];
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - 27);
  const dayOfWeek = startDay.getDay();
  startDay.setDate(startDay.getDate() - dayOfWeek);

  const endDay = new Date(startDay);
  endDay.setDate(startDay.getDate() + 41);

  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + w * 7 + d);
      const dateStr = getDateStr(date);
      const pct = getCompletionPct(dateStr);
      week.push({ dateStr, pct, day: date.getDay(), isToday: dateStr === currentDateStr, inRange: date <= today && date >= new Date(today.getTime() - 27 * 86400000) });
    }
    weeks.push(week);
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <TiltCard className="glow-success" glowColor="rgba(20, 184, 166, 0.12)">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Calendar size={16} style={{ color: 'var(--color-success)' }} />
        <span className="section-title" style={{ margin: 0 }}>28-Day Habit Heatmap</span>
      </div>

      <div className="heatmap-container">
        <div className="heatmap-labels">
          {dayLabels.map((label, i) => (
            <div key={i} className="heatmap-day-label">{label}</div>
          ))}
        </div>
        <div className="heatmap-grid">
          {weeks.map((week, wi) => (
            <div key={wi} className="heatmap-week">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`heatmap-cell ${day.isToday ? 'heatmap-today' : ''} ${day.inRange ? '' : 'heatmap-outside'}`}
                  style={{ backgroundColor: day.inRange ? getColor(day.pct) : 'transparent' }}
                  title={`${day.dateStr}: ${day.pct}% completion`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="heatmap-legend">
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Less</span>
        <div className="heatmap-legend-cell" style={{ backgroundColor: 'var(--color-border)' }} />
        <div className="heatmap-legend-cell" style={{ backgroundColor: 'rgba(20, 184, 166, 0.15)' }} />
        <div className="heatmap-legend-cell" style={{ backgroundColor: 'rgba(20, 184, 166, 0.35)' }} />
        <div className="heatmap-legend-cell" style={{ backgroundColor: 'rgba(20, 184, 166, 0.55)' }} />
        <div className="heatmap-legend-cell" style={{ backgroundColor: 'rgba(20, 184, 166, 0.75)' }} />
        <div className="heatmap-legend-cell" style={{ backgroundColor: 'var(--color-success)' }} />
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>More</span>
      </div>
    </TiltCard>
  );
}
