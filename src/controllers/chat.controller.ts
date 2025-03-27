const path = require('path');
const fs = require('fs');

import { Request, Response } from 'express';
import { ChatService } from '../services/chat';

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * Send a message to the chat
   * @param req - The request object
   * @param res - The response object
   */
  async sendMessage(req: Request, res: Response) {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message is required'
        });
      }

      const result = await this.chatService.sendMessage(message);

      if (result) {
        res.json({
          success: true,
          data: result
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to send message'
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred while sending the message'
      });
    }
  }

  /**
   * Close the chat
   * @param req - The request object
   * @param res - The response object
   */
  async closeChat(req: Request, res: Response) {

    try {
      // Close the chat
      await this.chatService.closeChat();

      res.json({
        success: true,
      });
    } catch (error) {
      console.error('Close chat error:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred while closing the chat'
      });
    }
  }

  /**
   * Export the chat history
   * @param req - The request object
   * @param res - The response object
   */
  async exportChat(req: Request, res: Response) {
    try {
      // Export the chat history
      const result = await this.chatService.exportChatHistory();

      if (result.success && result.data) {
        res.download(result.data, path.basename(result.data), (err) => {
          if (err) {
            console.error('Error sending file:', err);
          }
          // Clean up the file after sending
          fs.unlink(result.data, (unlinkErr: any) => {
            if (unlinkErr) {
              console.error('Error deleting file:', unlinkErr);
            }
          });
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to export chat'
        });
      }
    } catch (error) {
      console.error('Export chat error:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred while exporting the chat'
      });
    }
  }
} 