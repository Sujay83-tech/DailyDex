import React, { useState } from 'react';
import { History, Download, ChevronDown, ChevronUp, Check, Book } from 'lucide-react';
import { HABITS } from './ChecklistSection';
import TiltCard from './TiltCard';

export default function HistoryPanel({ dailyHistory }) {
  const [isOpen, setIsOpen] = useState(false);

  // Format date nicely
  const formatDate = (dateStr) => {
    try {
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  // Convert history array to CSV and download it
  const handleExportCSV = () => {
    if (dailyHistory.length === 0) {
      alert("No data available to export yet.");
      return;
    }

    // Define CSV headers
    const headers = [
      'Date', 
      'Completion Ratio', 
      'Tasks Completed Count', 
      'Tasks Completed List', 
      'Supplements Completed Count', 
      'Supplements Completed List', 
      'Study Session 1 Subject', 
      'Study Session 2 Subject'
    ];

    // Build rows
    const rows = dailyHistory.map(record => {
      // Find completed task names
      const completedTaskIds = record.completed_tasks || [];
      const completedTaskNames = HABITS
        .filter(h => completedTaskIds.includes(h.id))
        .map(h => h.label);

      const totalMandatory = 8;
      let completedMandatory = 0;
      const mandatoryIds = [
        'sleep', 'gym', 'cooking_morning', 'cooking_evening', 
        'office', 'self_care', 'reading_1', 'reading_2'
      ];
      completedTaskIds.forEach(id => {
        if (mandatoryIds.includes(id)) completedMandatory++;
      });

      const supplementsCount = record.completed_supplements?.length || 0;
      const supplementsList = record.completed_supplements || [];

      return [
        record.date,
        `${completedMandatory}/${totalMandatory}`,
        completedTaskIds.length,
        completedTaskNames.join('; '),
        supplementsCount,
        supplementsList.join('; '),
        record.reading_subject_1 || '',
        record.reading_subject_2 || ''
      ];
    });

    // Construct CSV Content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(val => {
          // Escape quotes and wrap in quotes to prevent CSV breakage
          const strVal = String(val);
          const escapedVal = strVal.replace(/"/g, '""');
          return `"${escapedVal}"`;
        }).join(',')
      )
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `habit_dashboard_backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TiltCard 
      className="glow-primary" 
      glowColor="rgba(245, 165, 36, 0.12)"
      style={{ padding: '1rem 1.25rem' }}
    >
      <button 
        className="collapsible-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <History size={16} style={{ color: 'var(--color-primary)' }} />
          <span>Historical Progress Log</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 'normal' }}>
            ({dailyHistory.length} days recorded)
          </span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="collapsible-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Scroll back through your logged daily performance.
            </span>
            <button 
              className="btn btn-secondary" 
              onClick={handleExportCSV}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
            >
              <Download size={12} />
              Export CSV
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {dailyHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                No historical logs available yet. Toggle a habit to start saving history.
              </div>
            ) : (
              dailyHistory.map(record => {
                const completedTaskIds = record.completed_tasks || [];
                const supplementsCount = record.completed_supplements?.length || 0;
                
                // Calculate completion scores
                const totalMandatory = 8;
                let completedMandatory = 0;
                const mandatoryIds = [
                  'sleep', 'gym', 'cooking_morning', 'cooking_evening', 
                  'office', 'self_care', 'reading_1', 'reading_2'
                ];
                completedTaskIds.forEach(id => {
                  if (mandatoryIds.includes(id)) completedMandatory++;
                });

                const percentage = Math.round((completedMandatory / totalMandatory) * 100);
                
                let scoreClass = 'low';
                if (percentage >= 80) scoreClass = 'high';
                else if (percentage >= 50) scoreClass = 'mid';

                const studiedSubject1 = record.reading_subject_1;
                const studiedSubject2 = record.reading_subject_2;

                return (
                  <div key={record.date} className="history-item">
                    <div className="history-header">
                      <span className="history-date">
                        {formatDate(record.date)}
                      </span>
                      <span className={`history-score ${scoreClass}`}>
                        {completedMandatory}/{totalMandatory} ({percentage}%)
                      </span>
                    </div>

                    <div className="history-details-list">
                      <div className="history-detail-row">
                        <span>Tasks Completed:</span>
                        <span>{completedTaskIds.length} / {HABITS.length} total</span>
                      </div>
                      <div className="history-detail-row">
                        <span>Supplements Taken:</span>
                        <span>{supplementsCount} / 7 total</span>
                      </div>

                      {/* Display study subjects if any exist */}
                      {(studiedSubject1 || studiedSubject2) && (
                        <div className="history-study-notes">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.15rem' }}>
                            <Book size={10} />
                            <span>Study Log:</span>
                          </div>
                          {studiedSubject1 && (
                            <div className="history-study-note-item">
                              • Session 1: "{studiedSubject1}"
                            </div>
                          )}
                          {studiedSubject2 && (
                            <div className="history-study-note-item" style={{ marginTop: '0.1rem' }}>
                              • Session 2: "{studiedSubject2}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </TiltCard>
  );
}
