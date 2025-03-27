const express = require('express');
import { Request, Response } from 'express';
import { ChatController } from '../controllers/chat.controller';

const router = express.Router();
const chatController = new ChatController();

// Render chat page
router.get('/', (req: Request, res: Response) => {
  res.render('chat');
});

// Send message
router.post('/send', (req: Request, res: Response) => chatController.sendMessage(req, res));

// Close chat
router.post('/close', (req: Request, res: Response) => chatController.closeChat(req, res));

// Export chat history
router.get('/export', (req: Request, res: Response) => chatController.exportChat(req, res));

export default router; 