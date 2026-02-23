import express from 'express';
import { getSchedules, createTask, updateTask, deleteTask, addDay, updateDay, deleteDay } from '../controllers/scheduleController.js';

const router = express.Router();

router.get('/schedules', getSchedules);
router.post('/tasks', createTask);
router.patch('/tasks/:date/:id', updateTask);
router.delete('/tasks/:date/:id', deleteTask);
router.post('/days', addDay);
router.patch('/days/:date', updateDay);
router.delete('/days/:date', deleteDay);

export default router;
