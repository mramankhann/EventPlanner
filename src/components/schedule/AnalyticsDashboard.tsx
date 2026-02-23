import { DaySchedule } from '@/types/schedule';
import { StatsCard } from './StatsCard';
import { ListTodo, CheckCircle2, Clock, CalendarClock, XCircle } from 'lucide-react';

interface AnalyticsDashboardProps {
  schedules: DaySchedule[];
}

export function AnalyticsDashboard({ schedules }: AnalyticsDashboardProps) {
  const allActivities = schedules.flatMap(day => day.activities);
  
  const totalTasks = allActivities.length;
  const completedTasks = allActivities.filter(a => a.status === 'done').length;
  const inProgressTasks = allActivities.filter(a => a.status === 'in progress').length;
  const upcomingTasks = allActivities.filter(a => a.status === 'upcoming').length;
  const cancelledTasks = allActivities.filter(a => a.status === 'cancelled').length;

  const calcPercentage = (count: number) => 
    totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      <StatsCard
        title="Total Tasks"
        value={totalTasks}
        icon={ListTodo}
        variant="total"
      />
      <StatsCard
        title="Completed"
        value={completedTasks}
        icon={CheckCircle2}
        variant="done"
        percentage={calcPercentage(completedTasks)}
      />
      <StatsCard
        title="In Progress"
        value={inProgressTasks}
        icon={Clock}
        variant="inProgress"
        percentage={calcPercentage(inProgressTasks)}
      />
      <StatsCard
        title="Upcoming"
        value={upcomingTasks}
        icon={CalendarClock}
        variant="upcoming"
        percentage={calcPercentage(upcomingTasks)}
      />
      <StatsCard
        title="Cancelled"
        value={cancelledTasks}
        icon={XCircle}
        variant="cancelled"
        percentage={calcPercentage(cancelledTasks)}
      />
    </div>
  );
}
