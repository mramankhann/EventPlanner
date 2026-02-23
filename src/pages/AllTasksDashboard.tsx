import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { DaySchedule, ActivityStatus } from '@/types/schedule';
import { DayAccordion } from '@/components/schedule/DayAccordion';
import { AnalyticsDashboard } from '@/components/schedule/AnalyticsDashboard';
import { ProgressRing } from '@/components/schedule/ProgressRing';
import { AddDayModal } from '@/components/schedule/AddDayModal';
import { CreateTaskModal } from '@/components/schedule/CreateTaskModal';
import { useSchedule } from '@/context/ScheduleContext';
import { Calendar, Sparkles, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';



export default function AllTasksDashboard() {
    const { schedules, updateActivity, addActivity, deleteActivity, addDay, createTask, updateDay, deleteDay } = useSchedule();
    const [expandedDayIndex, setExpandedDayIndex] = useState<number>(0);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'admin') {
            navigate('/dashboard/admin', { replace: true });
        }
    }, [user, navigate]);

    const handleToggleDay = (index: number) => {
        setExpandedDayIndex(expandedDayIndex === index ? -1 : index);
    };

    const handleUpdateActivity = (dayIndex: number, activityId: string, updates: { status?: ActivityStatus; time?: string }) => {
        updateActivity(dayIndex, activityId, updates);
    };

    const handleAddActivity = (dayIndex: number, time: string, title: string) => {
        addActivity(dayIndex, time, title);
    };

    const handleDeleteActivity = (dayIndex: number, activityId: string) => {
        deleteActivity(dayIndex, activityId);
    };

    const handleAddDay = (date: string, companyName?: string) => {
        addDay(date, companyName);
    };

    const handleCreateTask = (dayDate: string, time: string, title: string, status: ActivityStatus) => {
        createTask(dayDate, time, title, status);
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
        <>
            <Helmet>
                <title>All Tasks - Netlink's Event Planner</title>
                <meta name="description" content="View and manage all scheduled tasks across all days" />
            </Helmet>

            <div className="w-full max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-elevated">
                            <LayoutDashboard className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading flex items-center gap-2">
                                All Tasks
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
                            onUpdateDay={(updates) => updateDay(daySchedule.date, updates)}
                            onDeleteDay={() => deleteDay(daySchedule.date)}
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
        </>
    );
}
