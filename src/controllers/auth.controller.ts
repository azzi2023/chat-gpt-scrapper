import { Request, Response } from 'express';
import { ChatService } from '../services/chat';

export class AuthController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  /**
   * Login the user
   * @param req - The request object
   * @param res - The response object
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const loginResult = await this.chatService.login(email, password);

      // If login is successful, return a success message
      if (loginResult.success) {
        res.json({
          success: true,
          data: 'Login successful'
        });
      } else {
        res.status(401).json({
          success: false,
          error: loginResult.error || 'Login failed'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'An error occurred during login'
      });
    }
  }
} 