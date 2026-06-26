import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from './db';
import DashboardHeader from './components/DashboardHeader';
import KpiSummaryRow from './components/KpiSummaryRow';
import OverviewPanel from './components/OverviewPanel';
import ChecklistSection, { HABITS } from './components/ChecklistSection';
import SupplementsTracker from './components/SupplementsTracker';
import AccountabilityTracker from './components/AccountabilityTracker';
import TrendCharts from './components/TrendCharts';
import HistoryPanel from './components/HistoryPanel';
import WeeklyHeatmap from './components/WeeklyHeatmap';
import ConsistencyMascot from './components/ConsistencyMascot';
import TiltCard from './components/TiltCard';
import { Sparkles, Trophy, GripVertical } from 'lucide-react';

const SECTION_ORDER_KEY = 'dailydex_section_order';

function useDashboardSections() {
  const defaultOrder = ['accountability', 'mascot', 'heatmap', 'trends', 'history'];
  const [order, setOrder] = useState(() => {
    try {
      const saved = localStorage.getItem(SECTION_ORDER_KEY);
      return saved ? JSON.parse(saved) : defaultOrder;
    } catch { return defaultOrder; }
  });
  const [dragIndex, setDragIndex] = useState(null);

  const persistOrder = useCallback((newOrder) => {
    setOrder(newOrder);
    localStorage.setItem(SECTION_ORDER_KEY, JSON.stringify(newOrder));
  }, []);

  const onDragStart = useCallback((index) => { setDragIndex(index); }, []);
  const onDragOver = useCallback((e, index) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const newOrder = [...order];
    const [removed] = newOrder.splice(dragIndex, 1);
    newOrder.splice(index, 0, removed);
    persistOrder(newOrder);
    setDragIndex(index);
  }, [dragIndex, order, persistOrder]);
  const onDragEnd = useCallback(() => { setDragIndex(null); }, []);

  return { order, dragIndex, onDragStart, onDragOver, onDragEnd };
}

// Helper to get local YYYY-MM-DD date string
const getLocalDateString = (dateObj = new Date()) => {
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function App() {
  const [currentDate, setCurrentDate] = useState(() => getLocalDateString());
  const [loading, setLoading] = useState(true);
  
  // Today's states
  const [completedTasks, setCompletedTasks] = useState([]);
  const [completedSupplements, setCompletedSupplements] = useState([]);
  const [readingSubject1, setReadingSubject1] = useState('');
  const [readingSubject2, setReadingSubject2] = useState('');
  
  // Historical states
  const [dailyHistory, setDailyHistory] = useState([]);
  const [weeklyHistory, setWeeklyHistory] = useState([]);

  // Time Used Ref/Value
  const [completedHours, setCompletedHours] = useState(0);

  // Debounce refs for text inputs (to prevent spamming Supabase on every keystroke)
  const saveTimeoutRef = useRef({});

  // 1. Initial Load & Background polling for Date Shift (Midnight Reset)
  useEffect(() => {
    loadDashboardData(currentDate);

    // Poll every 30 seconds to check if the day has changed (Midnight Auto-Reset)
    const checkDateInterval = setInterval(() => {
      const todayStr = getLocalDateString();
      if (todayStr !== currentDate) {
        console.log(`Midnight transition detected: resetting from ${currentDate} to ${todayStr}`);
        setCurrentDate(todayStr);
        loadDashboardData(todayStr);
      }
    }, 30000);

    return () => {
      clearInterval(checkDateInterval);
      // Clear any pending save debounces on unmount
      Object.values(saveTimeoutRef.current).forEach(clearTimeout);
    };
  }, [currentDate]);

  // 2. Fetch data from DB Layer
  const loadDashboardData = async (targetDate) => {
    setLoading(true);
    try {
      // Fetch today's habit record
      const todayRecord = await db.getDailyHabit(targetDate);
      if (todayRecord) {
        setCompletedTasks(todayRecord.completed_tasks || []);
        setCompletedSupplements(todayRecord.completed_supplements || []);
        setReadingSubject1(todayRecord.reading_subject_1 || '');
        setReadingSubject2(todayRecord.reading_subject_2 || '');
      } else {
        // Reset state for the new day
        setCompletedTasks([]);
        setCompletedSupplements([]);
        setReadingSubject1('');
        setReadingSubject2('');
      }

      // Fetch history for Trend Charts and History Panel
      const dailyHist = await db.getDailyHistory(30); // get last 30 days
      setDailyHistory(dailyHist);

      const weeklyHist = await db.getWeeklyHistory(12); // get last 12 weeks
      setWeeklyHistory(weeklyHist);

    } catch (e) {
      console.error('Failed to load habit tracker data', e);
    } finally {
      setLoading(false);
    }
  };

  // 3. Recalculate Live Completed Hours whenever tasks change
  useEffect(() => {
    let hours = 0;
    HABITS.forEach(habit => {
      if (completedTasks.includes(habit.id)) {
        hours += habit.duration;
      }
    });
    setCompletedHours(hours);
  }, [completedTasks]);

  // 4. Save/Update Today's Habit logs (Triggered immediately on checkbox toggle)
  const saveDailyState = async (updatedTasks, updatedSupps, rSub1, rSub2) => {
    try {
      const savedRecord = await db.saveDailyHabit(currentDate, {
        tasks: updatedTasks,
        supplements: updatedSupps,
        reading_subject_1: rSub1,
        reading_subject_2: rSub2
      });

      // Update daily history state in memory to refresh trend graphs instantly
      setDailyHistory(prev => {
        const filtered = prev.filter(item => item.date !== currentDate);
        return [savedRecord, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
      });
    } catch (e) {
      console.error('Error auto-saving habits to DB:', e);
    }
  };

  // Callback: Toggling task checkboxes
  const handleToggleTask = (taskId, isChecked) => {
    let newTasks = [...completedTasks];
    if (isChecked) {
      if (!newTasks.includes(taskId)) newTasks.push(taskId);
    } else {
      newTasks = newTasks.filter(id => id !== taskId);
    }
    
    // Clear reading logs if unchecked
    let r1 = readingSubject1;
    let r2 = readingSubject2;
    if (taskId === 'reading_1' && !isChecked) r1 = '';
    if (taskId === 'reading_2' && !isChecked) r2 = '';

    setCompletedTasks(newTasks);
    if (taskId === 'reading_1' && !isChecked) setReadingSubject1('');
    if (taskId === 'reading_2' && !isChecked) setReadingSubject2('');

    saveDailyState(newTasks, completedSupplements, r1, r2);
  };

  // Callback: Toggling supplement checkbox capsules
  const handleToggleSupplement = (suppId, isChecked) => {
    let newSupps = [...completedSupplements];
    if (isChecked) {
      if (!newSupps.includes(suppId)) newSupps.push(suppId);
    } else {
      newSupps = newSupps.filter(id => id !== suppId);
    }
    setCompletedSupplements(newSupps);
    saveDailyState(completedTasks, newSupps, readingSubject1, readingSubject2);
  };

  // Callback: Typing in reading subjects (Debounced so we don't save on every keypress)
  const handleUpdateReadingSubject = (taskId, text) => {
    const isR1 = taskId === 'reading_1';
    
    if (isR1) {
      setReadingSubject1(text);
    } else {
      setReadingSubject2(text);
    }

    // Debounced autosave (500ms delay)
    if (saveTimeoutRef.current[taskId]) {
      clearTimeout(saveTimeoutRef.current[taskId]);
    }

    saveTimeoutRef.current[taskId] = setTimeout(() => {
      saveDailyState(
        completedTasks, 
        completedSupplements, 
        isR1 ? text : readingSubject1, 
        isR1 ? readingSubject1 : text
      );
    }, 500);
  };

  // Callback: Weekly accountability Friday check-in toggle
  const handleToggleAccountability = async (fridayDateStr, isChecked) => {
    try {
      const savedWeeklyRecord = await db.saveWeeklyAccountability(fridayDateStr, isChecked);
      
      // Update weekly history in memory
      setWeeklyHistory(prev => {
        const filtered = prev.filter(w => w.week_start_date !== fridayDateStr);
        return [savedWeeklyRecord, ...filtered].sort((a, b) => 
          b.week_start_date.localeCompare(a.week_start_date)
        );
      });
    } catch (e) {
      console.error('Error saving weekly check-in:', e);
    }
  };

  // Helper: Overall daily score completion percentage (only mandatory tasks count)
  const getDailyCompletionStats = () => {
    const mandatoryTasks = HABITS.filter(h => !habitIsOptional(h));
    const completedMandatory = completedTasks.filter(id => {
      const habit = HABITS.find(h => h.id === id);
      return habit && !habitIsOptional(habit);
    });

    const completedCount = completedMandatory.length;
    const totalCount = mandatoryTasks.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      completed: completedCount,
      total: totalCount,
      percentage
    };
  };

  const habitIsOptional = (habit) => {
    return habit.optional === true;
  };

  const completionStats = getDailyCompletionStats();
  const { order, dragIndex, onDragStart, onDragOver, onDragEnd } = useDashboardSections();

  // Show a nice loading skeleton during initial load
  if (loading && dailyHistory.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text-muted)'
      }}>
        <div className="circular-progress" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '1rem' }}>
          <svg><circle className="circular-bg" r="16" cx="24" cy="24" /><circle className="circular-fg" r="16" cx="24" cy="24" style={{ strokeDasharray: '50 100' }} /></svg>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span>Loading your DailyDex...</span>
      </div>
    );
  }

  // Calculate streaks to display a congrats banner if high completion is achieved
  const isExcellentDay = completionStats.percentage === 100;

  const rightPanelSections = {
    mascot: (
      <ConsistencyMascot
        dailyHistory={dailyHistory}
        currentDateStr={currentDate}
        completedTasks={completedTasks}
      />
    ),
    accountability: (
      <AccountabilityTracker
        weeklyHistory={weeklyHistory}
        onToggleAccountability={handleToggleAccountability}
        currentDateStr={currentDate}
      />
    ),
    heatmap: (
      <WeeklyHeatmap
        dailyHistory={dailyHistory}
        currentDateStr={currentDate}
      />
    ),
    trends: (
      <TrendCharts
        dailyHistory={dailyHistory}
        currentDateStr={currentDate}
      />
    ),
    history: (
      <HistoryPanel dailyHistory={dailyHistory} />
    ),
  };

  return (
    <>
      <div className="perspective-grid-container">
        <div className="grid-3d" />
        <div className="grid-horizon-glow" />
      </div>

      <div className="app-container">
        <DashboardHeader
          date={currentDate}
          stats={completionStats}
          isMock={db.isMock}
        />

        <KpiSummaryRow
          dailyHistory={dailyHistory}
          currentDateStr={currentDate}
          completedTasks={completedTasks}
          completionStats={completionStats}
        />

        {isExcellentDay && (
          <TiltCard
            className="glow-success"
            glowColor="rgba(20, 184, 166, 0.12)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: 'rgba(20, 184, 166, 0.08)',
              borderColor: 'var(--color-success)',
              padding: '1rem'
            }}
          >
          <div style={{
            background: 'rgba(20, 184, 166, 0.2)',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            color: 'var(--color-success)'
          }}>
            <Trophy size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>Disciplined Day Accomplished!</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
              You completed all 8 core habits today. Excellent work investing in your QA automation tester upskilling!
            </p>
          </div>
        </TiltCard>
      )}

      <OverviewPanel completedHours={completedHours} />

      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <ChecklistSection
            completedTasks={completedTasks}
            readingSubject1={readingSubject1}
            readingSubject2={readingSubject2}
            onToggleTask={handleToggleTask}
            onUpdateReadingSubject={handleUpdateReadingSubject}
            dailyHistory={dailyHistory}
            currentDateStr={currentDate}
          />

          <SupplementsTracker
            completedSupplements={completedSupplements}
            onToggleSupplement={handleToggleSupplement}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {order.map((sectionId, index) => (
            <div
              key={sectionId}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDragEnd={onDragEnd}
              style={{
                position: 'relative',
                opacity: dragIndex === index ? 0.5 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <div
                className="drag-handle"
                title="Drag to reorder"
              >
                <GripVertical size={14} />
              </div>
              {rightPanelSections[sectionId]}
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
  );
}
