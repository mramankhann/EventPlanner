import { DaySchedule } from '../models/DaySchedule.js';
import { createLog } from './adminController.js';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const getSchedules = async (req, res) => {
    const userId = req.headers['x-user-id'];

    try {
        // If userId is provided, filter by it. Otherwise return all (for public display)
        const query = userId ? { userId } : {};
        const schedules = await DaySchedule.find(query);
        const sorted = schedules.sort((a, b) => {
            const [dayA, monthA, yearA] = a.date.split('/').map(Number);
            const [dayB, monthB, yearB] = b.date.split('/').map(Number);
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA.getTime() - dateB.getTime();
        });
        res.json(sorted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTask = async (req, res) => {
    const userId = req.headers['x-user-id'];
    const userName = req.headers['x-user-name'] || 'User';
    console.log(`[POST /api/tasks] UserID: ${userId}`);
    console.log(`[POST /api/tasks] Body:`, req.body);
    if (!userId) return res.status(401).json({ message: "Missing user ID" });

    const { date, time, title, status } = req.body;
    try {
        console.log(`[createTask] Searching for schedule with date: "${date}" and userId: "${userId}"`);
        let daySchedule = await DaySchedule.findOne({ date, userId });

        if (!daySchedule) {
            console.log(`[createTask] No existing schedule found. Creating new one.`);
            daySchedule = new DaySchedule({ date, userId, activities: [] });
        } else {
            console.log(`[createTask] Found existing schedule: ${daySchedule._id}`);
        }

        const newActivity = {
            id: generateId(),
            time,
            title,
            status,
            createdAt: new Date()
        };

        daySchedule.activities.push(newActivity);
        daySchedule.activities.sort((a, b) => a.time.localeCompare(b.time));

        await daySchedule.save();

        // Log activity
        await createLog(userId, userName, 'Event published', title);

        res.status(201).json(daySchedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTask = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: "Missing user ID" });

    const { date, id } = req.params;
    const updates = req.body;

    try {
        const daySchedule = await DaySchedule.findOne({ date, userId });
        if (!daySchedule) return res.status(404).json({ message: "Day not found" });

        const activity = daySchedule.activities.find(a => a.id === id);
        if (!activity) return res.status(404).json({ message: "Activity not found" });

        Object.assign(activity, updates);

        if (updates.time) {
            daySchedule.activities.sort((a, b) => a.time.localeCompare(b.time));
        }

        await daySchedule.save();
        res.json(daySchedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTask = async (req, res) => {
    const userId = req.headers['x-user-id'];
    const userName = req.headers['x-user-name'] || 'User';
    if (!userId) return res.status(401).json({ message: "Missing user ID" });

    const { date, id } = req.params;
    try {
        const daySchedule = await DaySchedule.findOne({ date, userId });
        if (!daySchedule) return res.status(404).json({ message: "Day not found" });

        const activity = daySchedule.activities.find(a => a.id === id);
        if (activity) {
            const title = activity.title;
            daySchedule.activities = daySchedule.activities.filter(a => a.id !== id);
            await daySchedule.save();
            // Log activity
            await createLog(userId, userName, 'Event deleted', title);
        }

        res.json(daySchedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDay = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: "Missing user ID" });

    const { date } = req.params;
    try {
        const result = await DaySchedule.findOneAndDelete({ date, userId });
        if (!result) return res.status(404).json({ message: "Day not found" });
        res.json({ message: "Day deleted successfully", date });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addDay = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: "Missing user ID" });

    const { date, companyName } = req.body;
    try {
        let daySchedule = await DaySchedule.findOne({ date, userId });
        if (daySchedule) return res.status(400).json({ message: "Day already exists" });

        daySchedule = new DaySchedule({ date, companyName, userId, activities: [] });
        await daySchedule.save();
        res.status(201).json(daySchedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDay = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ message: "Missing user ID" });

    const { date } = req.params;
    const { companyName } = req.body;

    try {
        const daySchedule = await DaySchedule.findOne({ date, userId });
        if (!daySchedule) return res.status(404).json({ message: "Day not found" });

        daySchedule.companyName = companyName;
        await daySchedule.save();
        res.json(daySchedule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
