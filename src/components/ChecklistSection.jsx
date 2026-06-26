import React, { useState } from 'react';
import { BookOpen, Award, CheckSquare, Sparkles, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import TiltCard from './TiltCard';

export const HABITS = [
  {
    id: 'sleep',
    label: 'Got 7 hours of sleep',
    duration: 7.0,
    timing: 'Previous night',
    category: 'Sleep',
    optional: false
  },
  {
    id: 'gym',
    label: 'Workout session',
    duration: 0.8, // 48-50 mins
    timing: 'Morning only (fixed)',
    category: 'Gym',
    optional: false
  },
  {
    id: 'cooking_morning',
    label: 'Morning cooking',
    duration: 0.75, // 45 mins
    timing: 'Morning (fixed)',
    category: 'Cooking',
    optional: false
  },
  {
    id: 'cooking_evening',
    label: 'Evening cooking',
    duration: 0.75, // 45 mins
    timing: 'Evening (fixed)',
    category: 'Cooking',
    optional: false
  },
  {
    id: 'office',
    label: 'Office work',
    duration: 6.0,
    timing: 'Fixed work block',
    category: 'Office',
    optional: false
  },
  {
    id: 'self_care',
    label: 'Self-care time',
    duration: 1.0,
    timing: 'Flexible',
    category: 'Self-care',
    optional: false
  },
  {
    id: 'reading_1',
    label: 'Reading session 1',
    duration: 1.5,
    timing: 'Flexible timing',
    category: 'Study/Reading',
    optional: false,
    hasSubject: true,
    subjectKey: 'reading_subject_1'
  },
  {
    id: 'reading_2',
    label: 'Reading session 2',
    duration: 1.5,
    timing: 'Flexible timing',
    category: 'Study/Reading',
    optional: false,
    hasSubject: true,
    subjectKey: 'reading_subject_2'
  },
  {
    id: 'devotional',
    label: 'Devotional/Indian scripture reading (Bhagavad Gita, Mahabharat, etc.)',
    duration: 0.75, // 45 mins
    timing: 'Flexible, as time allows',
    category: 'Devotional',
    optional: true
  },
  {
    id: 'leisure',
    label: 'Entertainment (movies / Instagram / YouTube / podcasts)',
    duration: 3.95,
    timing: 'Flexible',
    category: 'Leisure',
    optional: true
  }
];

function getDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function computeSparkline(habitId, dailyHistory, currentDateStr) {
  const today = new Date(currentDateStr + 'T00:00:00');
  const historyMap = {};
  dailyHistory.forEach(r => { historyMap[r.date] = r; });
  const points = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = getDateStr(d);
    const record = historyMap[ds];
    points.push(record?.completed_tasks?.includes(habitId) ? 1 : 0);
  }
  return points;
}

function Sparkline({ data, color }) {
  const width = 48;
  const height = 16;
  if (data.every(v => v === 0)) return null;
  const max = 1;
  const xStep = width / (data.length - 1);
  const path = data.map((p, i) => {
    const x = i * xStep;
    const y = height - (p / max) * (height - 4) - 2;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible', flexShrink: 0 }}>
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      {data.map((p, i) => p === 1 && (
        <circle key={i} cx={i * xStep} cy={height - (p / max) * (height - 4) - 2} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

export default function ChecklistSection({ 
  completedTasks, 
  readingSubject1, 
  readingSubject2, 
  onToggleTask, 
  onUpdateReadingSubject,
  dailyHistory,
  currentDateStr,
}) {
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (name) => {
    setCollapsedCategories(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const categories = {};
  HABITS.forEach(habit => {
    if (!categories[habit.category]) {
      categories[habit.category] = [];
    }
    categories[habit.category].push(habit);
  });

  const habitSparklines = {};
  if (dailyHistory && currentDateStr) {
    HABITS.forEach(h => {
      habitSparklines[h.id] = computeSparkline(h.id, dailyHistory, currentDateStr);
    });
  }

  return (
    <TiltCard className="glow-primary" glowColor="rgba(245, 165, 36, 0.12)">
      <h2 className="section-title">
        <CheckSquare size={18} />
        Daily Habits Checklist
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Object.entries(categories).map(([categoryName, habits]) => {
          const isCollapsed = collapsedCategories[categoryName];
          const catCompleted = habits.filter(h => completedTasks.includes(h.id)).length;

          return (
            <div key={categoryName} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <button
                onClick={() => toggleCategory(categoryName)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.075em',
                  borderBottom: '1px solid var(--color-border)',
                  padding: '0.35rem 0',
                  marginTop: '0.15rem',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {categoryName}
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'none' }}>
                    {catCompleted}/{habits.length}
                  </span>
                </span>
                {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>

              {!isCollapsed && habits.map(habit => {
                const isChecked = completedTasks.includes(habit.id);
                const isReading1 = habit.id === 'reading_1';
                const isReading2 = habit.id === 'reading_2';
                const subjectValue = isReading1 ? readingSubject1 : (isReading2 ? readingSubject2 : '');
                const sparkData = habitSparklines[habit.id];

                return (
                  <div 
                    key={habit.id} 
                    className={`task-row ${isChecked ? 'is-completed' : ''}`}
                    style={{ padding: '0.6rem 0.75rem' }}
                  >
                    <label className={`task-checkbox-container ${habit.optional ? 'is-optional' : ''}`}>
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={(e) => onToggleTask(habit.id, e.target.checked)}
                      />
                      <span className="checkmark"></span>
                    </label>

                    <div className="task-details">
                      <div className="task-title" style={{ fontSize: '0.85rem' }}>
                        {habit.label}
                      </div>
                      
                      <div className="task-meta">
                        <span className="meta-badge duration">{habit.duration} hrs</span>
                        <span className="meta-badge timing">{habit.timing}</span>
                        {habit.optional && (
                          <span className="meta-badge optional" style={{ color: 'var(--color-secondary)' }}>
                            Optional
                          </span>
                        )}
                        {sparkData && <Sparkline data={sparkData} color={isChecked ? 'var(--color-success)' : 'var(--color-text-muted)'} />}
                      </div>

                      {habit.hasSubject && isChecked && (
                        <div className="reading-input-wrapper">
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--color-secondary)', 
                            fontWeight: 500, 
                            marginBottom: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <BookOpen size={12} />
                            What did you study in this session?
                          </div>
                          <input 
                            type="text" 
                            placeholder="e.g. Postgres Indexing / Automation Testing Design Patterns"
                            className="reading-input"
                            value={subjectValue}
                            onChange={(e) => onUpdateReadingSubject(habit.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </TiltCard>
  );
}
