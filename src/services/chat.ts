const UserAgent = require('user-agents');

const fs = require('fs');
const path = require('path');
import { connect } from 'puppeteer-real-browser';
import { Browser, Page } from 'rebrowser-puppeteer-core';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class ChatService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private chatHistory: ChatMessage[] = [];

  constructor() { }
  /**
   * Initialize the browser
   * @returns {Promise<void>} - Returns a promise that resolves when the browser is initialized
   */
  private async initializeBrowser(): Promise<void> {
    if (!this.browser) {
      const { browser, page } = await connect({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
        ],
      });
      this.browser = browser;
      this.page = page;

      // Set up page with stealth measures
      await this.page.setViewport({
        width: 1920,
        height: 1080,
      });

      // Set geolocation
      await this.page.setGeolocation({
        latitude: 40.7128,
        longitude: -74.0060,
      });

      const userAgent = new UserAgent({ deviceCategory: 'desktop' });
      await this.page.setUserAgent(userAgent.toString());
    }
  }

  /**
   * Login to ChatGPT
   * @param email - The email address of the user
   * @param password - The password of the user
   * @returns {success: boolean, error?: string} - Returns true if login is successful, otherwise returns false and an error message
   */
  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required'
        };
      }
      await this.initializeBrowser();
      if (!this.page) throw new Error('Page not initialized');

      // Navigate to ChatGPT
      const currentUrl = this.page.url();
      if (currentUrl !== 'https://chatgpt.com/') {
        await this.page.goto('https://chatgpt.com/', { waitUntil: 'networkidle0', timeout: 60000 });
      }

      // Handle login if credentials are provided
      if (email && password) {
        try {
          const loginButton = await this.page.$('button[data-testid="login-button"]');
          if (loginButton) {
            await loginButton.click();
            await this.page.waitForNavigation({ waitUntil: 'networkidle0' });

            const emailInput = await this.page.$('input[name="email"]');
            // Type the email address
            if (emailInput) {
              await emailInput.type(email);
            }

            let continueButton = await this.page.$('input[name="continue"]');
            if (continueButton) {
              await continueButton.click();
            }

            await new Promise(resolve => setTimeout(resolve, 10000));

            const passwordInput = await this.page.$('input[type="password"]');
            if (!passwordInput) {
              return { success: false, error: 'email or password is incorrect' };
            }
            await passwordInput.type(password);

            const actionButton = await this.page.$('button[name="action"]');
            if (!actionButton) {
              return { success: false, error: 'email or password is incorrect' };
            }
            await actionButton.click();

            await new Promise(resolve => setTimeout(resolve, 10000));

            const error = await this.page.$('span[id="error-element-password"]');
            if (error) {
              return { success: false, error: 'email or password is incorrect' };
            }

            await this.page.waitForNavigation({ waitUntil: 'networkidle0' });

            const otpInput = await this.page.$('input[type="number"]');
            if (otpInput) {
              return { success: false, error: 'Cannot bypass 2FA' };
            }
            await this.page.waitForSelector('div[id="prompt-textarea"] p');

          }
        } catch (loginError) {
          console.error('Login error:', loginError);
          return { success: false, error: 'Cannot bypass Captcha' };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send a message to ChatGPT
   * @param message - The message to send to ChatGPT
   * @returns {Promise<{ response: string }>} - Returns a promise that resolves to the response from ChatGPT
   */
  async sendMessage(message: string): Promise<{ response: string }> {
    try {
      await this.initializeBrowser();
      if (!this.page) throw new Error('Page not initialized');

      // Navigate to ChatGPT
      const currentUrl = this.page.url();
      if (currentUrl !== 'https://chatgpt.com/') {
        await this.page.goto('https://chatgpt.com/', { waitUntil: 'networkidle0', timeout: 60000 });
      }

      // Add user message to history
      this.chatHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Type the message with human-like delays
      await this.page.type('div[id="prompt-textarea"] p', message, { delay: 50 });

      // Click send button
      const sendButton = await this.page.$('button[aria-label="Send prompt"]');
      if (sendButton) {
        await sendButton.click();
      } else {
        throw new Error('Send button not found');
      }

      // Wait for response
      await this.page.waitForSelector('div[data-message-author-role="assistant"]', { timeout: 30000 });

      await new Promise(resolve => setTimeout(resolve, 20000));
      // Get the response
      const response = await this.page.evaluate(() => {
        const elements = document.querySelectorAll('div[data-message-author-role="assistant"]');
        return elements[elements.length - 1].textContent;
      });

      // Add assistant response to history
      this.chatHistory.push({
        role: 'assistant',
        content: response || '',
        timestamp: new Date()
      });

      return { response: response || '' };
    } catch (error) {
      console.error('Error in chat service:', error);
      throw new Error('Failed to process message');
    }
  }

  /**
   * Export the chat history to a CSV file
   * @returns {Promise<{ success: boolean; data?: string; error?: string }>} - Returns a promise that resolves to the result of the export operation
   */
  async exportChatHistory(): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      if (!this.chatHistory.length) {
        return {
          success: false,
          error: 'No chat history available to export'
        };
      }

      // Create CSV content
      const csvContent = [
        ['Role', 'Message', 'Timestamp'],
        ...this.chatHistory.map(msg => [
          msg.role,
          `"${msg.content.replace(/"/g, '""')}"`, // Escape quotes in content
          msg.timestamp.toISOString()
        ])
      ].map(row => row.join(',')).join('\n');

      // Create exports directory if it doesn't exist
      const exportsDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir);
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `chat-history-${timestamp}.csv`;
      const filepath = path.join(exportsDir, filename);

      // Write to file
      fs.writeFileSync(filepath, csvContent);

      return {
        success: true,
        data: filepath
      };
    } catch (error) {
      console.error('Error exporting chat history:', error);
      return {
        success: false,
        error: 'Failed to export chat history'
      };
    }
  }

  /**
   * Close the chat
   * @returns {Promise<void>} - Returns a promise that resolves when the chat is closed
   */
  async closeChat(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    // Clear chat history when closing
    this.chatHistory = [];
  }
}

export default ChatService; 