import { Request as ExpressRequest, Response, NextFunction } from 'express';
import UserService from '../services/userService';
import jwt from 'jsonwebtoken';

interface Request extends ExpressRequest {
  user?: {
    userId: number;
  };
}

class AuthController {
  /**
   * Register a new user
   */
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ error: 'All fields are required.' });
        return;
      }

      const newUser = await UserService.registerUser(username, email, password);
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user and generate a JWT token
   */
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const user = await UserService.authenticateUser(email, password);

      if (!user) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      // Generate JWT
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default_secret', {
          expiresIn: '1h',
      });

      res.json({ token });
    } catch (error) {
        next(error);
    }
  }

  /**
   * Protected route example: Get the current user's info
   */
  public async getProfile(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await UserService.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json(user);
  }
}

export default new AuthController();
