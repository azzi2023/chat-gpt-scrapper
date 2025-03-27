const express = require('express');
import { Request, Response } from 'express';

const router = express.Router();

// Page routes
router.get('/', (req: Request, res: Response) => {
  res.render('login');
});

router.get('/chat', (req: Request, res: Response) => {
  res.render('chat');
});

export default router; 