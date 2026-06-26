import React, { useState } from 'react';
import { ShieldCheck, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import TiltCard from './TiltCard';

/**
 * Helper to calculate the Friday date of the current week.
 * Week starts on Monday, ends on Sunday. Friday is the anchor.
 */
export function getCurrentWeekFriday(dateObj = new Date()) {
  const day = dateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const d = new Date(dateObj);
  
  // Calculate distance to Friday (5)
  // If Friday, distance = 0
  // If Saturday (6), distance = -1
  // If Sunday (0), distance = -2
  // If Monday (1), distance = +4
  // If Tuesday (2), distance = +3
  // If Wednesday (3), distance = +2
  // If Thursday (4), distance = +1
  let diff = 5 - day;
  if (day === 0) { // Sunday is end of week cycle, previous Friday
    diff = -2;
  } else if (day === 6) { // Saturday is end of week cycle, previous Friday
    diff = -1;
  }
  
  d.setDate(d.getDate() + diff);
  
  // Format as YYYY-MM-DD in local time
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function AccountabilityTracker({ 
  weeklyHistory, 
  onToggleAccountability, 
  currentDateStr 
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const today = new Date(currentDateStr + 'T00:00:00');
  const isFriday = today.getDay() === 5;
  const currentFridayDate = getCurrentWeekFriday(today);

  // Find if checked for this week
  const thisWeekRecord = weeklyHistory.find(r => r.week_start_date === currentFridayDate);
  const isDisciplined = thisWeekRecord ? thisWeekRecord.disciplined : false;

  // Calculate Streak
  // Sort weekly history by date descending
  const sortedHistory = [...weeklyHistory].sort((a, b) => 
    b.week_start_date.localeCompare(a.week_start_date)
  );

  let streak = 0;
  if (sortedHistory.length > 0) {
    // If today is Friday or later, the current week's check-in counts.
    // If it's earlier than Friday, we check starting from the previous week's Friday.
    let expectedFriday = currentFridayDate;
    
    // If today is Monday-Thursday and we haven't checked in this week (obviously, since it's not Friday yet),
    // we start counting from the previous week.
    const todayDay = today.getDay();
    const isBeforeFriday = todayDay >= 1 && todayDay <= 4;
    
    let checkIndex = 0;
    if (isBeforeFriday && !isDisciplined) {
      // Find the previous Friday
      const prevFridayDateObj = new Date(today);
      const diff = todayDay === 0 ? -9 : (todayDay === 6 ? -8 : -5); // distance to last Friday
      prevFridayDateObj.setDate(prevFridayDateObj.getDate() + (5 - todayDay - 7));
      const prevFridayStr = prevFridayDateObj.toISOString().split('T')[0];
      expectedFriday = prevFridayStr;
      
      // Find start index in sorted history that matches or is before previous Friday
      checkIndex = sortedHistory.findIndex(r => r.week_start_date <= expectedFriday);
      if (checkIndex === -1) checkIndex = 0;
    }

    // Traverse sorted records to find contiguous true values
    let tempDate = new Date(expectedFriday + 'T00:00:00');
    
    for (let i = checkIndex; i < sortedHistory.length; i++) {
      const record = sortedHistory[i];
      
      // Ensure we are checking the exact consecutive Friday
      const recDate = record.week_start_date;
      
      if (record.disciplined) {
        streak++;
      } else {
        // Break if we hit a week where they weren't disciplined (only if it's in the past)
        if (recDate < currentFridayDate || isFriday) {
          break;
        }
      }
    }
  }

  return (
    <TiltCard 
      className="glow-secondary accountability-card" 
      glowColor="rgba(167, 139, 250, 0.12)"
      style={{ padding: '1rem 1.25rem' }}
    >
      <button 
        className="collapsible-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <ShieldCheck size={16} style={{ color: 'var(--color-secondary)' }} />
          <span>Weekly Accountability Check-in</span>
          {streak > 0 && (
            <span className="streak-counter weekly" style={{ margin: 0, padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
              <Flame size={10} style={{ fill: 'currentColor' }} />
              {streak}w Streak
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="collapsible-content" style={{ marginTop: '0.75rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            A private log to record personal discipline consistency. Checked once a week.
          </p>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem', 
            background: 'rgba(0, 0, 0, 0.15)', 
            padding: '0.75rem', 
            borderRadius: '8px',
            border: '1px solid var(--color-border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Stayed disciplined this week?
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                  Week of Fri, {currentFridayDate}
                </div>
              </div>

              {/* Weekly Checkbox */}
              <label 
                className="task-checkbox-container is-optional" 
                style={{ 
                  pointerEvents: isFriday ? 'auto' : 'none',
                  opacity: isFriday ? 1 : 0.5 
                }}
                title={isFriday ? "Check to log discipline" : "Only active on Fridays"}
              >
                <input 
                  type="checkbox" 
                  checked={isDisciplined}
                  disabled={!isFriday}
                  onChange={(e) => onToggleAccountability(currentFridayDate, e.target.checked)}
                />
                <span className="checkmark"></span>
              </label>
            </div>

            {!isFriday && (
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--color-secondary)', 
                fontStyle: 'italic', 
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: '0.5rem',
                textAlign: 'center'
              }}>
                🔒 Weekly check-in opens on Fridays. Current weekly streak is {streak} {streak === 1 ? 'week' : 'weeks'}.
              </div>
            )}
            
            {isFriday && !isDisciplined && (
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--color-primary)', 
                fontStyle: 'italic', 
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: '0.5rem',
                textAlign: 'center'
              }}>
                🔓 Check-in active today! Maintain your {streak} week streak.
              </div>
            )}
          </div>
        </div>
      )}
    </TiltCard>
  );
}
