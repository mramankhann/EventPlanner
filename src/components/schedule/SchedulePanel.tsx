import { useState } from 'react';
import { DaySchedule, ActivityStatus } from '@/types/schedule';
import { DayAccordion } from './DayAccordion';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ProgressRing } from './ProgressRing';
import { AddDayModal } from './AddDayModal';
import { CreateTaskModal } from './CreateTaskModal';
import { initialSchedules } from '@/data/schedules';
import { Calendar, Sparkles } from 'lucide-react';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function SchedulePanel() {
  const [schedules, setSchedules] = useState<DaySchedule[]>(initialSchedules);
  const [expandedDayIndex, setExpandedDayIndex] = useState<number>(2);

  const handleToggleDay = (index: number) => {
    setExpandedDayIndex(expandedDayIndex === index ? -1 : index);
  };

  const handleUpdateActivity = (dayIndex: number, activityId: string, updates: { status?: ActivityStatus; time?: string }) => {
    setSchedules(prev => {
      const newSchedules = [...prev];
      const daySchedule = { ...newSchedules[dayIndex] };
      daySchedule.activities = daySchedule.activities.map(activity => {
        if (activity.id === activityId) {
          return { ...activity, ...updates };
        }
        if (updates.status === 'in progress' && activity.status === 'in progress') {
          return { ...activity, status: 'upcoming' as ActivityStatus };
        }
        return activity;
      });
      newSchedules[dayIndex] = daySchedule;
      return newSchedules;
    });
  };

  const handleAddActivity = (dayIndex: number, time: string, title: string) => {
    setSchedules(prev => {
      const newSchedules = [...prev];
      const daySchedule = { ...newSchedules[dayIndex] };
      const newActivity = {
        id: generateId(),
        time,
        title,
        status: 'upcoming' as ActivityStatus,
      };
      daySchedule.activities = [newActivity, ...daySchedule.activities];
      newSchedules[dayIndex] = daySchedule;
      return newSchedules;
    });
  };

  const handleDeleteActivity = (dayIndex: number, activityId: string) => {
    setSchedules(prev => {
      const newSchedules = [...prev];
      const daySchedule = { ...newSchedules[dayIndex] };
      daySchedule.activities = daySchedule.activities.filter(a => a.id !== activityId);
      newSchedules[dayIndex] = daySchedule;
      return newSchedules;
    });
  };

  const handleAddDay = (date: string) => {
    setSchedules(prev => {
      const newDay: DaySchedule = {
        date,
        activities: [],
      };
      const newSchedules = [...prev, newDay].sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA);
        const dateB = new Date(yearB, monthB - 1, dayB);
        return dateA.getTime() - dateB.getTime();
      });
      return newSchedules;
    });
  };

  const handleCreateTask = (dayDate: string, time: string, title: string, status: ActivityStatus) => {
    setSchedules(prev => {
      const newSchedules = [...prev];
      const dayIndex = newSchedules.findIndex(d => d.date === dayDate);
      if (dayIndex !== -1) {
        const daySchedule = { ...newSchedules[dayIndex] };
        const newActivity = {
          id: generateId(),
          time,
          title,
          status,
        };
        daySchedule.activities = [...daySchedule.activities, newActivity].sort((a, b) => 
          a.time.localeCompare(b.time)
        );
        newSchedules[dayIndex] = daySchedule;
      }
      return newSchedules;
    });
  };

  // Calculate overall stats
  const totalActivities = schedules.reduce((sum, day) => sum + day.activities.length, 0);
  const totalCompleted = schedules.reduce(
    (sum, day) => sum + day.activities.filter(a => a.status === 'done').length,
    0
  );
  const completionPercentage = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;

  const existingDates = schedules.map(s => s.date);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-elevated">
            <Calendar className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading flex items-center gap-2">
              Visit Day Schedule
              <Sparkles className="w-6 h-6 text-warning" />
            </h1>
            <p className="text-muted-foreground mt-1">
              {schedules.length} days • {totalActivities} total tasks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AddDayModal existingDates={existingDates} onAddDay={handleAddDay} />
          <CreateTaskModal schedules={schedules} onCreateTask={handleCreateTask} />
        </div>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard schedules={schedules} />

      {/* Progress Overview */}
      <div className="bg-card rounded-2xl p-6 mb-8 shadow-soft border border-border">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ProgressRing progress={completionPercentage} size={140} strokeWidth={10} />
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Overall Progress</h3>
            <p className="text-muted-foreground text-sm mb-4">
              You've completed {totalCompleted} out of {totalActivities} tasks across {schedules.length} days.
            </p>
            
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{totalCompleted}/{totalActivities} tasks</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary via-in-progress to-success transition-all duration-700 ease-out rounded-full"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Days */}
      <div className="space-y-4">
        {schedules.map((daySchedule, index) => (
          <DayAccordion
            key={daySchedule.date}
            daySchedule={daySchedule}
            isExpanded={expandedDayIndex === index}
            onToggle={() => handleToggleDay(index)}
            onUpdateActivity={(activityId, updates) => handleUpdateActivity(index, activityId, updates)}
            onAddActivity={(time, title) => handleAddActivity(index, time, title)}
            onDeleteActivity={(activityId) => handleDeleteActivity(index, activityId)}
          />
        ))}
      </div>

      {schedules.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Schedule Days</h3>
          <p className="text-muted-foreground mb-4">Get started by adding your first schedule day.</p>
          <AddDayModal existingDates={existingDates} onAddDay={handleAddDay} />
        </div>
      )}
    </div>
  );
}
