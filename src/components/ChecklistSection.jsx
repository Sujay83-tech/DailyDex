import React from 'react';
import { BookOpen, Award, CheckSquare, Sparkles } from 'lucide-react';
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

export default function ChecklistSection({ 
  completedTasks, 
  readingSubject1, 
  readingSubject2, 
  onToggleTask, 
  onUpdateReadingSubject 
}) {
  
  // Group habits by category
  const categories = {};
  HABITS.forEach(habit => {
    if (!categories[habit.category]) {
      categories[habit.category] = [];
    }
    categories[habit.category].push(habit);
  });

  return (
    <TiltCard className="glow-primary" glowColor="rgba(245, 165, 36, 0.12)">
      <h2 className="section-title">
        <CheckSquare size={18} />
        Daily Habits Checklist
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {Object.entries(categories).map(([categoryName, habits]) => (
          <div key={categoryName} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Category Header */}
            <div style={{ 
              fontSize: '0.8rem', 
              fontWeight: 700, 
              color: 'var(--color-primary)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.075em',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '0.25rem',
              marginBottom: '0.25rem'
            }}>
              {categoryName}
            </div>

            {/* Habits list in category */}
            {habits.map(habit => {
              const isChecked = completedTasks.includes(habit.id);
              const isReading1 = habit.id === 'reading_1';
              const isReading2 = habit.id === 'reading_2';
              const subjectValue = isReading1 ? readingSubject1 : (isReading2 ? readingSubject2 : '');

              return (
                <div 
                  key={habit.id} 
                  className={`task-row ${isChecked ? 'is-completed' : ''}`}
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
                    <div className="task-title">
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
                    </div>

                    {/* Reading Subject Text Input (only reveal when checked) */}
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
        ))}
      </div>
    </TiltCard>
  );
}
