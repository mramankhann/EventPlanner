import { AuditLog } from '../models/AuditLog.js';
import { DaySchedule } from '../models/DaySchedule.js';
import { User } from '../models/User.js';

export const getStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Events Created (Today / This Month)
        // We look into activities in DaySchedule. 
        // Note: activities are nested in DaySchedule.
        const allSchedules = await DaySchedule.find({});

        let eventsToday = 0;
        let eventsMonth = 0;
        let upcomingEvents = 0;
        let cancelledEvents = 0;

        const hourlyUsage = {}; // To find peak usage time

        allSchedules.forEach(schedule => {
            schedule.activities.forEach(activity => {
                const createdAt = activity.createdAt || schedule.createdAt || new Date();
                if (createdAt >= startOfToday) eventsToday++;
                if (createdAt >= startOfMonth) eventsMonth++;

                // Upcoming Events Count (Status is 'Scheduled' or similar, and date is in future)
                // For simplicity, we'll check status and if the schedule date is >= today
                const [day, month, year] = schedule.date.split('/').map(Number);
                const eventDate = new Date(year, month - 1, day);

                if (eventDate >= startOfToday && activity.status !== 'Cancelled') {
                    upcomingEvents++;
                }

                if (activity.status === 'Cancelled' || activity.status === 'Failed') {
                    cancelledEvents++;
                }

                // Peak Usage Time (based on activity.time)
                const hour = activity.time.split(':')[0];
                if (hour) {
                    hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
                }
            });
        });

        let peakUsageTime = "N/A";
        let maxEvents = 0;
        for (const hour in hourlyUsage) {
            if (hourlyUsage[hour] > maxEvents) {
                maxEvents = hourlyUsage[hour];
                peakUsageTime = `${hour}:00`;
            }
        }

        res.json({
            eventsToday,
            eventsMonth,
            upcomingEvents,
            cancelledEvents,
            peakUsageTime
        });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

export const getLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (error) {
        console.error('Logs Error:', error);
        res.status(500).json({ message: 'Server error fetching logs' });
    }
};

export const createLog = async (userId, userName, action, target) => {
    // Audit logging disabled by configuration
    return;
};
