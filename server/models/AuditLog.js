import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true }, // e.g., 'User Created', 'Login', 'Event Published'
    target: { type: String }, // e.g., name of created user, event title
    timestamp: { type: Date, default: Date.now }
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
