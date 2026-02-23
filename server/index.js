import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { DaySchedule } from './models/DaySchedule.js';
import authRoutes from './routes/authRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
app.use(cors({
    origin: '*', // Allow all origins for debugging
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-name']
}));
app.use(express.json());

// Identify correct server
app.get('/', (req, res) => {
    res.send('Event Planner Backend is Running!');
});

// Connect to Database
connectDB().then(async () => {
    try {
        // Fix for E11000 duplicate key error: Drop the old partial index on 'date'
        // so the new compound index { userId: 1, date: 1 } can work.
        await DaySchedule.collection.dropIndex('date_1');
        console.log("Legacy 'date_1' index dropped successfully.");
    } catch (e) {
        // Index might not exist, ignoring error
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', scheduleRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
