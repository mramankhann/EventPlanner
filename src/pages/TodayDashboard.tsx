import { useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { DaySchedule, ActivityStatus } from '@/types/schedule';
import { DayAccordion } from '@/components/schedule/DayAccordion';
import { AnalyticsDashboard } from '@/components/schedule/AnalyticsDashboard';
import { ProgressRing } from '@/components/schedule/ProgressRing';
import { CreateTaskModal } from '@/components/schedule/CreateTaskModal';
import { useSchedule } from '@/context/ScheduleContext';
import { Calendar, Sparkles, Sun } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TodayDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { schedules, updateActivity, addActivity, deleteActivity, createTask, updateDay, deleteDay } = useSchedule();

    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/dashboard/admin', { replace: true });
        }
    }, [user, navigate]);

    // Get today's date in the format used by the schedules
    const todayFormatted = format(new Date(), 'dd/MM/yyyy');

    // Find today's schedule or create an empty one
    const todaySchedule = useMemo(() => {
        const existing = schedules.find(s => s.date === todayFormatted);
        if (existing) return existing;
        return { date: todayFormatted, activities: [] } as DaySchedule;
    }, [schedules, todayFormatted]);

    const handleUpdateActivity = (activityId: string, updates: { status?: ActivityStatus; time?: string }) => {
        const dayIndex = schedules.findIndex(s => s.date === todayFormatted);
        if (dayIndex !== -1) {
            updateActivity(dayIndex, activityId, updates);
        }
    };

    const handleUpdateDay = (updates: { companyName: string }) => {
        updateDay(todayFormatted, updates);
    };

    const handleAddActivity = (time: string, title: string) => {
        const dayIndex = schedules.findIndex(s => s.date === todayFormatted);
        if (dayIndex !== -1) {
            addActivity(dayIndex, time, title);
        } else {
            createTask(todayFormatted, time, title, 'upcoming');
        }
    };

    const handleDeleteActivity = (activityId: string) => {
        const dayIndex = schedules.findIndex(s => s.date === todayFormatted);
        if (dayIndex !== -1) {
            deleteActivity(dayIndex, activityId);
        }
    };

    const handleDeleteDay = () => {
        deleteDay(todayFormatted);
    };

    const handleCreateTask = (dayDate: string, time: string, title: string, status: ActivityStatus) => {
        createTask(dayDate, time, title, status);
    };

    // Calculate today's stats
    const totalActivities = todaySchedule.activities.length;
    const totalCompleted = todaySchedule.activities.filter(a => a.status === 'done').length;
    const completionPercentage = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;

    // Wrap today's schedule in an array for AnalyticsDashboard
    const todayScheduleArray = todaySchedule.activities.length > 0 ? [todaySchedule] : [];

    return (
        <>
            <Helmet>
                <title>Today's Tasks - Netlink's Event Planner</title>
                <meta name="description" content="View and manage today's scheduled tasks and activities" />
            </Helmet>

            <div className="w-full max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-warning to-warning/80 shadow-elevated">
                            <Sun className="w-8 h-8 text-warning-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading flex items-center gap-2">
                                Today's Tasks
                                <Sparkles className="w-6 h-6 text-warning" />
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {format(new Date(), 'EEEE, MMMM d, yyyy')} • {totalActivities} tasks
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <CreateTaskModal schedules={schedules} onCreateTask={handleCreateTask} fixedDate={todayFormatted} />
                    </div>
                </div>

                {/* Analytics Dashboard */}
                <AnalyticsDashboard schedules={todayScheduleArray} />

                {/* Progress Overview */}
                <div className="bg-card rounded-2xl p-6 mb-8 shadow-soft border border-border">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <ProgressRing progress={completionPercentage} size={140} strokeWidth={10} />

                        <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">Today's Progress</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                You've completed {totalCompleted} out of {totalActivities} tasks for today.
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

                {/* Today's Schedule */}
                {todaySchedule.activities.length > 0 ? (
                    <DayAccordion
                        daySchedule={todaySchedule}
                        isExpanded={true}
                        onToggle={() => { }}
                        onUpdateActivity={handleUpdateActivity}
                        onAddActivity={handleAddActivity}
                        onDeleteActivity={handleDeleteActivity}
                        onUpdateDay={handleUpdateDay}
                        onDeleteDay={handleDeleteDay}
                    />
                ) : (
                    <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
                        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Tasks for Today</h3>
                        <p className="text-muted-foreground mb-4">Start by adding your first task for today.</p>
                        <CreateTaskModal schedules={schedules} onCreateTask={handleCreateTask} fixedDate={todayFormatted} />
                    </div>
                )}
            </div>
        </>
    );
}
