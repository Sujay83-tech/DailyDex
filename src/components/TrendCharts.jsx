import React from 'react';
import { BarChart3, BookOpen, Dumbbell, Briefcase, Pill, LineChart } from 'lucide-react';
import TiltCard from './TiltCard';

export default function TrendCharts({ dailyHistory, currentDateStr }) {
  // Generate last 7 days dates in chronological order (oldest to newest)
  const getLast7Days = () => {
    const days = [];
    const today = new Date(currentDateStr + 'T00:00:00');
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W...
      days.push({ dateStr, dayLabel });
    }
    return days;
  };

  const last7Days = getLast7Days();

  // Map history to easily searchable object
  const historyMap = {};
  dailyHistory.forEach(record => {
    historyMap[record.date] = record;
  });

  // Calculate metrics for the last 7 days
  const chartData = last7Days.map(day => {
    const record = historyMap[day.dateStr];
    
    // 1. Study Hours: Reading 1 = 1.5, Reading 2 = 1.5. Max = 3.0
    let studyHours = 0;
    if (record?.completed_tasks) {
      if (record.completed_tasks.includes('reading_1')) studyHours += 1.5;
      if (record.completed_tasks.includes('reading_2')) studyHours += 1.5;
    }

    // 2. Gym Attendance: binary (1 or 0)
    const gymDone = record?.completed_tasks?.includes('gym') ? 1 : 0;

    // 3. Office Hours: 6 hrs if done, else 0
    const officeDone = record?.completed_tasks?.includes('office') ? 1 : 0;

    // 4. Supplements compliance %: count checked / 7 total
    const suppCount = record?.completed_supplements?.length || 0;
    const suppPct = Math.round((suppCount / 7) * 100);

    // 5. Overall completion %: completed mandatory / 8 total
    let mandatoryCompleted = 0;
    const mandatoryIds = [
      'sleep', 'gym', 'cooking_morning', 'cooking_evening', 
      'office', 'self_care', 'reading_1', 'reading_2'
    ];
    if (record?.completed_tasks) {
      mandatoryIds.forEach(id => {
        if (record.completed_tasks.includes(id)) {
          mandatoryCompleted++;
        }
      });
    }
    const overallPct = Math.round((mandatoryCompleted / 8) * 100);

    return {
      dayLabel: day.dayLabel,
      dateStr: day.dateStr,
      studyHours,
      gymDone,
      officeDone,
      suppPct,
      overallPct
    };
  });

  // Helper to generate SVG sparkline path for continuous values (like Study Hours, Overall %)
  const generateSparklinePath = (points, width, height, maxVal) => {
    if (points.length === 0) return '';
    const xStep = width / (points.length - 1);
    
    return points.map((p, i) => {
      const x = i * xStep;
      // In SVG, y=0 is top. We want high values at the top.
      const y = height - (p / (maxVal || 1)) * (height - 8) - 4;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  // Helper to generate SVG sparkline area path (closes at the bottom)
  const generateSparklineAreaPath = (points, width, height, maxVal) => {
    const linePath = generateSparklinePath(points, width, height, maxVal);
    if (!linePath) return '';
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  };

  // Sparkline dimensions
  const sparkWidth = 100;
  const sparkHeight = 32;

  return (
    <TiltCard className="glow-secondary" glowColor="rgba(167, 139, 250, 0.12)" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
        <BarChart3 size={18} style={{ color: 'var(--color-secondary)' }} />
        Weekly Trends & Consistency
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        
        {/* 1. Study Hours Sparkline */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BookOpen size={14} style={{ color: 'var(--color-secondary)' }} />
              Study Hours
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Target: 3.0h / day
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Sparkline Chart */}
            <svg width={sparkWidth} height={sparkHeight} className="sparkline-svg">
              <defs>
                <linearGradient id="violet-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d={generateSparklineAreaPath(chartData.map(d => d.studyHours), sparkWidth, sparkHeight, 3.0)} 
                className="sparkline-area" 
              />
              <path 
                d={generateSparklinePath(chartData.map(d => d.studyHours), sparkWidth, sparkHeight, 3.0)} 
                className="sparkline-path" 
              />
            </svg>
            
            {/* Labels container */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '45px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-secondary)' }}>
                {chartData[chartData.length - 1].studyHours.toFixed(1)}h
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Today</span>
            </div>
          </div>
        </div>

        {/* 2. Gym Attendance Row of Circles */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Dumbbell size={14} style={{ color: 'var(--color-primary)' }} />
              Gym Attendance
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Workout frequency
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {chartData.map((d, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '0.2rem' 
                }}
              >
                <div 
                  className={`trend-circle-3d ${d.gymDone ? 'active-gym' : ''}`}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '50%', 
                    backgroundColor: d.gymDone ? 'var(--color-success)' : 'rgba(255,255,255,0.05)',
                    border: d.gymDone ? '1px solid var(--color-success)' : '1px solid var(--color-border)',
                  }}
                  title={`Gym done on ${d.dateStr}: ${d.gymDone ? 'Yes' : 'No'}`}
                />
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{d.dayLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Office Hours Row of Circles */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Briefcase size={14} style={{ color: 'var(--color-secondary)' }} />
              Office Work
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              6h work shifts logged
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {chartData.map((d, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '0.2rem' 
                }}
              >
                <div 
                  className={`trend-circle-3d ${d.officeDone ? 'active-office' : ''}`}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    borderRadius: '50%', 
                    backgroundColor: d.officeDone ? 'var(--color-secondary)' : 'rgba(255,255,255,0.05)',
                    border: d.officeDone ? '1px solid var(--color-secondary)' : '1px solid var(--color-border)',
                  }}
                  title={`Office done on ${d.dateStr}: ${d.officeDone ? 'Yes' : 'No'}`}
                />
                <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)' }}>{d.dayLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Supplements Compliance Columns */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Pill size={14} style={{ color: 'var(--color-success)' }} />
              Supplements
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Completion ratio
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.45rem', height: '28px', paddingBottom: '2px' }}>
            {chartData.map((d, i) => {
              const barHeight = Math.max(2, (d.suppPct / 100) * 20);
              return (
                <div 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '0.2rem' 
                  }}
                >
                  <div 
                    className="trend-bar-3d"
                    style={{ 
                      width: '12px', 
                      height: `${barHeight}px`, 
                      backgroundColor: d.suppPct > 0 ? 'var(--color-success)' : 'rgba(255,255,255,0.05)',
                      transition: 'height 0.3s',
                    }}
                    title={`Supplements compliance on ${d.dateStr}: ${d.suppPct}%`}
                  />
                  <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>{d.dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Overall Completion Sparkline */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <LineChart size={14} style={{ color: 'var(--color-success)' }} />
              Daily Score
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Habit completion rate
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Sparkline Chart */}
            <svg width={sparkWidth} height={sparkHeight} className="sparkline-svg">
              <defs>
                <linearGradient id="teal-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path 
                d={generateSparklineAreaPath(chartData.map(d => d.overallPct), sparkWidth, sparkHeight, 100)} 
                style={{ fill: 'url(#teal-gradient)', opacity: 0.12 }}
              />
              <path 
                d={generateSparklinePath(chartData.map(d => d.overallPct), sparkWidth, sparkHeight, 100)} 
                style={{ fill: 'none', stroke: 'var(--color-success)', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}
              />
            </svg>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '45px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-success)' }}>
                {chartData[chartData.length - 1].overallPct}%
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Today</span>
            </div>
          </div>
        </div>

      </div>
    </TiltCard>
  );
}
