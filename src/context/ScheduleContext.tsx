import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { DaySchedule, ActivityStatus } from '@/types/schedule';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const API_URL = 'http://10.95.4.70:5001/api';

interface ScheduleContextType {
    schedules: DaySchedule[];
    updateActivity: (dayIndex: number, activityId: string, updates: { status?: ActivityStatus; time?: string; title?: string }) => void;
    addActivity: (dayIndex: number, time: string, title: string) => void;
    deleteActivity: (dayIndex: number, activityId: string) => void;
    addDay: (date: string, companyName?: string) => void;
    updateDay: (date: string, updates: { companyName: string }) => void;
    deleteDay: (date: string) => void;
    createTask: (dayDate: string, time: string, title: string, status: ActivityStatus) => void;
    refreshSchedules: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
    const [schedules, setSchedules] = useState<DaySchedule[]>([]);
    const { user } = useAuth();

    const refreshSchedules = useCallback(async () => {
        console.log("ScheduleProvider: Fetching schedules...");
        try {
            const headers: Record<string, string> = {};
            if (user) {
                headers['x-user-id'] = user.id;
            }

            // Add timestamp to prevent caching
            const res = await fetch(`${API_URL}/schedules?_t=${Date.now()}`, {
                headers
            });
            const data = await res.json();
            setSchedules(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
        }
    }, [user]);

    useEffect(() => {
        refreshSchedules();
    }, [refreshSchedules]);

    const updateActivity = async (dayIndex: number, activityId: string, updates: { status?: ActivityStatus; time?: string; title?: string }) => {
        const day = schedules[dayIndex];
        if (!day || !user) return;

        try {
            const res = await fetch(`${API_URL}/tasks/${day.date.replace(/\//g, '%2F')}/${activityId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify(updates)
            });
            if (!res.ok) {
                const err = await res.json();
                console.error("Failed to update activity:", err);
                return;
            }
            const updatedDay = await res.json();

            setSchedules(prev => {
                const newSchedules = [...prev];
                // Replace the day with the updated one from server
                const idx = newSchedules.findIndex(d => d.date === updatedDay.date);
                if (idx !== -1) newSchedules[idx] = updatedDay;
                return newSchedules;
            });
        } catch (error) {
            console.error("Failed to update activity", error);
        }
    };

    const addActivity = async (dayIndex: number, time: string, title: string) => {
        const day = schedules[dayIndex];
        if (!day || !user) return;

        try {
            // Re-using the generic create task endpoint which finds day by date
            const res = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({
                    date: day.date,
                    time,
                    title,
                    status: 'upcoming'
                })
            });
            if (!res.ok) {
                const err = await res.json();
                console.error("Failed to add activity:", err);
                return;
            }
            const updatedDay = await res.json();

            setSchedules(prev => {
                const newSchedules = [...prev];
                const idx = newSchedules.findIndex(d => d.date === updatedDay.date);
                if (idx !== -1) newSchedules[idx] = updatedDay;
                return newSchedules;
            });
        } catch (error) {
            console.error("Failed to add activity", error);
        }
    };

    const deleteActivity = async (dayIndex: number, activityId: string) => {
        const day = schedules[dayIndex];
        if (!day || !user) return;

        try {
            const res = await fetch(`${API_URL}/tasks/${day.date.replace(/\//g, '%2F')}/${activityId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': user.id
                }
            });
            const updatedDay = await res.json();

            setSchedules(prev => {
                const newSchedules = [...prev];
                const idx = newSchedules.findIndex(d => d.date === updatedDay.date);
                if (idx !== -1) newSchedules[idx] = updatedDay;
                return newSchedules;
            });
        } catch (error) {
            console.error("Failed to delete activity", error);
        }
    };

    const addDay = async (date: string, companyName?: string) => {
        if (!user) {
            console.error("addDay: User is null");
            return;
        }
        try {
            console.log("addDay: Sending request", date);
            const res = await fetch(`${API_URL}/days`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({ date, companyName })
            });

            // If 201 created, add to state.
            if (res.ok) {
                const newDay = await res.json();
                setSchedules(prev => {
                    const newSchedules = [...prev, newDay].sort((a, b) => {
                        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
                        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
                        const dateA = new Date(yearA, monthA - 1, dayA);
                        const dateB = new Date(yearB, monthB - 1, dayB);
                        return dateA.getTime() - dateB.getTime();
                    });
                    return newSchedules;
                });
            }
        } catch (error) {
            console.error("Failed to add day", error);
        }
    };

    const updateDay = async (date: string, updates: { companyName: string }) => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/days/${date.replace(/\//g, '%2F')}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                const updatedDay = await res.json();
                setSchedules(prev => {
                    const newSchedules = [...prev];
                    const idx = newSchedules.findIndex(d => d.date === updatedDay.date);
                    if (idx !== -1) newSchedules[idx] = updatedDay;
                    return newSchedules;
                });
                toast.success('Day updated successfully');
            } else {
                toast.error('Failed to update day');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error updating day');
        }
    };

    const deleteDay = async (date: string) => {
        if (!user) return;
        try {
            const res = await fetch(`${API_URL}/days/${date.replace(/\//g, '%2F')}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': user.id
                }
            });

            if (res.ok) {
                setSchedules(prev => prev.filter(d => d.date !== date));
                toast.success('Day deleted successfully');
            } else {
                toast.error('Failed to delete day');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error deleting day');
        }
    };

    const createTask = async (dayDate: string, time: string, title: string, status: ActivityStatus) => {
        if (!user) {
            console.error("createTask: User is null");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user.id
                },
                body: JSON.stringify({
                    date: dayDate,
                    time,
                    title,
                    status
                })
            });

            if (!res.ok) {
                const err = await res.json();
                console.error("Failed to create task:", err);
                toast.error(`Failed: ${err.message || 'Unknown error'}`);
                return;
            }
            const updatedDay = await res.json();
            toast.success("Task created successfully!");

            setSchedules(prev => {
                const newSchedules = [...prev];
                const idx = newSchedules.findIndex(d => d.date === updatedDay.date);
                if (idx !== -1) {
                    newSchedules[idx] = updatedDay;
                } else {
                    newSchedules.push(updatedDay);
                    // Sort
                    newSchedules.sort((a, b) => {
                        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
                        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
                        const dateA = new Date(yearA, monthA - 1, dayA);
                        const dateB = new Date(yearB, monthB - 1, dayB);
                        return dateA.getTime() - dateB.getTime();
                    });
                }
                return newSchedules;
            });
        } catch (error) {
            console.error("Failed to create task", error);
        }
    };

    return (
        <ScheduleContext.Provider value={{ schedules, updateActivity, addActivity, deleteActivity, addDay, updateDay, deleteDay, createTask, refreshSchedules }}>
            {children}
        </ScheduleContext.Provider>
    );
}

export function useSchedule() {
    const context = useContext(ScheduleContext);
    if (context === undefined) {
        throw new Error('useSchedule must be used within a ScheduleProvider');
    }
    return context;
}
