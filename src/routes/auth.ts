const express = require('express');
import { Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = express.Router();
const authController = new AuthController();

// Login route
router.post('/login', (req: Request, res: Response) => authController.login(req, res));

export default router; 