const express = require('express');
import { Request, Response } from 'express';
import chatRoutes from './chat';
import authRoutes from './auth';

const router = express.Router();

// Page routes
router.get('/', (req: Request, res: Response) => {
  res.render('login');
});

router.get('/chat', (req: Request, res: Response) => {
  res.render('chat');
});

// API routes
router.use('/chat', chatRoutes);
router.use('/auth', authRoutes);

export default router; 