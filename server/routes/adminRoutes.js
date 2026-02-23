import express from 'express';
import { getStats, getLogs } from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', getStats);
router.get('/logs', getLogs);

export default router;
