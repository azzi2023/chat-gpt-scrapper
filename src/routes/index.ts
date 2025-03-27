const express = require('express');
import chatRoutes from './chat';
import authRoutes from './auth';
import viewRoutes from './view';

const router = express.Router();

// Use view routes
router.use('/', viewRoutes);

// API routes
router.use('/chat', chatRoutes);
router.use('/auth', authRoutes);

export default router; 