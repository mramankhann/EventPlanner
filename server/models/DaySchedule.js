import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    id: String,
    time: String,
    title: String,
    status: String,
    createdAt: { type: Date, default: Date.now }
});

const dayScheduleSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: String },
    companyName: { type: String, default: '' },
    activities: [activitySchema],
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure uniqueness of date PER USER
dayScheduleSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DaySchedule = mongoose.model('DaySchedule', dayScheduleSchema);
