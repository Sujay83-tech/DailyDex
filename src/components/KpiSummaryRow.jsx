import React from 'react';
import { Flame, CheckCircle2, CalendarDays } from 'lucide-react';

function allPillarsDone(tasks) {
  const PILLARS = [
    { checkIds: ['gym'] },
    { checkIds: ['reading_1', 'reading_2'] },
    { checkIds: ['office'] },
    { checkIds: ['sleep'] },
  ];
  return PILLARS.every(p => p.checkIds.every(id => tasks.includes(id)));
}

function getDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calcStreak(dailyHistory, currentDateStr, completedTasks) {
  const historyMap = {};
  dailyHistory.forEach(r => { historyMap[r.date] = r; });
  const today = new Date(currentDateStr + 'T00:00:00');
  const todayAllDone = allPillarsDone(completedTasks);
  let streak = 0;
  const startDay = todayAllDone ? 0 : 1;
  for (let i = startDay; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = getDateStr(d);
    if (i === 0) {
      if (todayAllDone) { streak++; } else { break; }
      continue;
    }
    const record = historyMap[dateStr];
    const tasks = record?.completed_tasks || [];
    if (allPillarsDone(tasks)) { streak++; } else { break; }
  }
  return streak;
}

function calcMonthlyStats(dailyHistory, currentDateStr) {
  const today = new Date(currentDateStr + 'T00:00:00');
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let tracked = 0;
  dailyHistory.forEach(r => {
    const d = new Date(r.date + 'T00:00:00');
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) tracked++;
  });
  return { tracked, daysInMonth };
}

export default function KpiSummaryRow({ dailyHistory, currentDateStr, completedTasks, completionStats }) {
  const streak = calcStreak(dailyHistory, currentDateStr, completedTasks);
  const { tracked, daysInMonth } = calcMonthlyStats(dailyHistory, currentDateStr);

  const cards = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${streak} ${streak === 1 ? 'day' : 'days'}`,
      color: 'var(--color-primary)',
      bg: 'rgba(245, 165, 36, 0.08)',
      border: 'rgba(245, 165, 36, 0.2)',
    },
    {
      icon: CheckCircle2,
      label: 'Daily Completion',
      value: `${completionStats.percentage}%`,
      sub: `${completionStats.completed}/${completionStats.total} tasks`,
      color: 'var(--color-success)',
      bg: 'rgba(20, 184, 166, 0.08)',
      border: 'rgba(20, 184, 166, 0.2)',
    },
    {
      icon: CalendarDays,
      label: 'Days Tracked',
      value: `${tracked}/${daysInMonth}`,
      sub: 'this month',
      color: 'var(--color-secondary)',
      bg: 'rgba(167, 139, 250, 0.08)',
      border: 'rgba(167, 139, 250, 0.2)',
    },
  ];

  return (
    <div className="kpi-row">
      {cards.map((card, i) => (
        <div key={i} className="kpi-card" style={{ background: card.bg, borderColor: card.border }}>
          <div className="kpi-icon" style={{ background: card.bg, color: card.color }}>
            <card.icon size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{card.label}</span>
            <span className="kpi-value" style={{ color: card.color }}>{card.value}</span>
            {card.sub && <span className="kpi-sub">{card.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
