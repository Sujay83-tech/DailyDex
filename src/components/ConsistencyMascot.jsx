import React from 'react';
import TiltCard from './TiltCard';
import { Flame as FlameIcon, Dumbbell, BookOpen, Briefcase, Moon } from 'lucide-react';
import GamificationBadges from './GamificationBadges';

/**
 * The 4 core pillars that define a "consistent day".
 * ALL must be completed to keep the streak alive.
 */
const PILLARS = [
  { key: 'gym', label: 'Workout', Icon: Dumbbell, checkIds: ['gym'] },
  { key: 'study', label: 'Study', Icon: BookOpen, checkIds: ['reading_1', 'reading_2'] },
  { key: 'office', label: 'Office', Icon: Briefcase, checkIds: ['office'] },
  { key: 'sleep', label: 'Sleep', Icon: Moon, checkIds: ['sleep'] },
];

const STAGE_CONFIG = {
  0: { message: 'Good try, restart again!', subtext: 'Complete all 4 pillars to ignite your streak', glowHue: 'rgba(239, 68, 68, 0.12)', accent: '#ef4444' },
  1: { message: 'Spark Ignited!', subtext: 'Day 1 — The journey of a thousand miles begins', glowHue: 'rgba(249, 115, 22, 0.12)', accent: '#f97316' },
  2: { message: 'Flame Growing!', subtext: 'Day 2 — Building real momentum', glowHue: 'rgba(245, 158, 11, 0.12)', accent: '#f59e0b' },
  3: { message: 'Getting Stronger!', subtext: 'Day 3 — Discipline is forming', glowHue: 'rgba(234, 179, 8, 0.12)', accent: '#eab308' },
  4: { message: 'Almost Legendary!', subtext: 'Day 4 — One more day to greatness', glowHue: 'rgba(251, 191, 36, 0.12)', accent: '#fbbf24' },
  5: { message: 'LEGENDARY STREAK!', subtext: '5+ Days — You are an unstoppable force!', glowHue: 'rgba(254, 240, 138, 0.14)', accent: '#fef08a' },
};

function getDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function allPillarsDone(tasks) {
  return PILLARS.every(p => p.checkIds.every(id => tasks.includes(id)));
}

export default function ConsistencyMascot({ dailyHistory, currentDateStr, completedTasks }) {
  // Build history lookup
  const historyMap = {};
  dailyHistory.forEach(r => { historyMap[r.date] = r; });

  const today = new Date(currentDateStr + 'T00:00:00');
  const todayAllDone = allPillarsDone(completedTasks);

  // Calculate streak: consecutive days (including today if complete)
  let streak = 0;
  const startDay = todayAllDone ? 0 : 1; // if today incomplete, start from yesterday

  for (let i = startDay; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getDateStr(d);

    // For today, use live completedTasks state (most current)
    if (i === 0) {
      if (todayAllDone) { streak++; } else { break; }
      continue;
    }

    const record = historyMap[dateStr];
    const tasks = record?.completed_tasks || [];
    if (allPillarsDone(tasks)) {
      streak++;
    } else {
      break;
    }
  }

  const stage = Math.min(streak, 5);
  const config = STAGE_CONFIG[stage];

  // Today's per-pillar live status
  const pillarStatus = PILLARS.map(p => ({
    ...p,
    done: p.checkIds.every(id => completedTasks.includes(id)),
  }));

  // Flame scale grows with streak
  const flameScale = 0.4 + stage * 0.14;

  return (
    <TiltCard
      className={stage === 0 ? '' : 'glow-primary'}
      glowColor={config.glowHue}
    >
      <div className="mascot-container">
        {/* Header */}
        <div className="mascot-header">
          <FlameIcon size={18} style={{ color: config.accent }} />
          <span>Consistency Streak</span>
        </div>

        {/* Main Visual */}
        <div className="mascot-visual">
          {stage === 0 ? (
            /* ── Skull ── */
            <div className="skull-container">
              <svg viewBox="0 0 100 112" width="88" height="96" className="skull-svg">
                <defs>
                  <filter id="skullGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  <radialGradient id="eyeGlow"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" /><stop offset="100%" stopColor="#ef4444" stopOpacity="0" /></radialGradient>
                </defs>
                {/* cranium */}
                <path d="M50 6 C20 6 6 28 6 52 C6 70 17 82 32 86 L32 102 L42 102 L42 89 L50 89 L58 89 L58 102 L68 102 L68 86 C83 82 94 70 94 52 C94 28 80 6 50 6Z"
                  fill="#1a1d24" stroke="#ef4444" strokeWidth="2" filter="url(#skullGlow)" />
                {/* eye sockets */}
                <ellipse cx="35" cy="46" rx="11" ry="13" fill="#0d0f13" stroke="#ef4444" strokeWidth="1.5" />
                <ellipse cx="65" cy="46" rx="11" ry="13" fill="#0d0f13" stroke="#ef4444" strokeWidth="1.5" />
                {/* glowing pupils */}
                <ellipse cx="35" cy="46" rx="6" ry="7" fill="url(#eyeGlow)" />
                <ellipse cx="65" cy="46" rx="6" ry="7" fill="url(#eyeGlow)" />
                {/* inner pupil dots */}
                <circle cx="35" cy="46" r="2.5" fill="#ef4444" opacity="0.7" />
                <circle cx="65" cy="46" r="2.5" fill="#ef4444" opacity="0.7" />
                {/* nose */}
                <path d="M46 64 L54 64 L50 73Z" fill="#0d0f13" stroke="#ef4444" strokeWidth="1" />
                {/* jaw line teeth */}
                <rect x="32" y="86" width="36" height="16" rx="2" fill="#1a1d24" stroke="#ef4444" strokeWidth="1.5" />
                <line x1="40" y1="86" x2="40" y2="102" stroke="#0d0f13" strokeWidth="2" />
                <line x1="50" y1="86" x2="50" y2="102" stroke="#0d0f13" strokeWidth="2" />
                <line x1="60" y1="86" x2="60" y2="102" stroke="#0d0f13" strokeWidth="2" />
              </svg>
            </div>
          ) : (
            /* ── Flame ── */
            <div className="flame-wrapper" style={{ transform: `scale(${flameScale})` }}>
              {/* ambient glow */}
              <div className="flame-glow" style={{ background: `radial-gradient(circle, ${config.accent}30 0%, transparent 70%)` }} />
              <div className="flame-layer flame-outer" />
              <div className="flame-layer flame-middle" />
              <div className="flame-layer flame-inner" />
              <div className="flame-layer flame-core" />
              {stage >= 4 && (
                <>
                  <div className="flame-spark spark-1" />
                  <div className="flame-spark spark-2" />
                  <div className="flame-spark spark-3" />
                </>
              )}
              {stage >= 5 && <div className="flame-crown">👑</div>}
            </div>
          )}
        </div>

        {/* Streak message */}
        <div className="mascot-message">
          <div className="mascot-title" style={{ color: config.accent }}>
            {stage === 0 ? '💀' : '🔥'} {config.message}
          </div>
          <div className="mascot-subtext">{config.subtext}</div>
          {streak > 0 && (
            <div className="mascot-streak-badge" style={{ borderColor: `${config.accent}66`, color: config.accent }}>
              {streak} Day{streak !== 1 ? 's' : ''} Streak
            </div>
          )}
        </div>

        {/* 4 Pillar Status */}
        <div className="pillars-row">
          {pillarStatus.map(p => (
            <div key={p.key} className={`pillar-indicator ${p.done ? 'pillar-done' : 'pillar-pending'}`}>
              <p.Icon size={16} />
              <span className="pillar-label">{p.label}</span>
              <span className={`pillar-status ${p.done ? 'status-done' : 'status-pending'}`}>
                {p.done ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>

        {/* 5-Day Progress Dots */}
        <div className="streak-dots-row">
          {[1, 2, 3, 4, 5].map(day => (
            <div key={day} className="streak-dot-wrapper">
              <div
                className={`streak-dot ${streak >= day ? 'dot-filled' : 'dot-empty'}`}
                style={streak >= day ? { backgroundColor: config.accent, boxShadow: `0 0 8px ${config.accent}55` } : {}}
              />
              <span className="dot-label">D{day}</span>
            </div>
          ))}
        </div>

        {/* Gamification Badges */}
        <GamificationBadges streak={streak} />
      </div>
    </TiltCard>
  );
}
