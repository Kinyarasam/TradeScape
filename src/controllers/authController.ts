import { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import UserService from '../services/userService';
import TokenService from '../services/tokenService';

interface Request extends ExpressRequest {
  user?: {
    userId: string;
  };
}

const redisClient = new Redis();

// Configure your email service (example with Nodemailer)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
  },
});

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

      // Save token in Redis for quick lookup
      const tokenExpiration = 60 * 60;  // 1 hour in seconds
      await redisClient.set(`auth_token:${token}`, 'true', 'EX', tokenExpiration);

      // Save token in the database
      const expiresAt = new Date(Date.now() + tokenExpiration * 1000);
      await TokenService.saveToken(user.id, token, expiresAt);

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

  /**
   * Logs out and destroys access tokens.
   * @param req Express Request object
   * @param res Express Response object
   * @returns void
   */
  public async logout(req: Request, res: Response): Promise<void> {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(400).json({ error: 'No token provided.' });
        return;
    }

    // Decode the token to get the expiration time
    const decoded = jwt.decode(token) as { exp: number, userId: string };
    const expirationInSeconds = decoded.exp - Math.floor(Date.now() / 1000);

    // Blacklist in Redis
    await redisClient.set(`blacklisted_token:${token}`, 'true', 'EX', expirationInSeconds);

    // Update token status in the database
    await TokenService.blacklistToken(token);

    res.json({ message: 'Successfully logged out.' });
  }

  /**
   * Password request logic
   * @param req Request
   * @param res Response
   * @returns void
   */
  public async requestPasswordReset(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required.' });
      return;
    }

    const user = await UserService.getUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Generate a password reset token
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'default_secret', {
      expiresIn: '15m',  // Token expires in 15 minutes
    });

    /**
     * @todo: create queues to handle the email sending logic.
     * This is to ensure retries and handle downtimes of the
     * email sending logic.
     */
    try {
      // Send email with the reset link
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `Click the link to reset your password: ${process.env.CLIENT_URL}/reset-password?token=${resetToken}`,
      });
    } catch (err) {
      console.error(err);
    }

    res.json({ message: 'Password reset email sent.' });
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required.' });
      return;
    }

    try {
      /**
       * @todo: Separate the auth token from the password reset token.
       */
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: string };
      const user = await UserService.getUserById(payload.userId);

      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the user's password
      await UserService.updatePassword(user.id, hashedPassword);

      res.json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
  }
}

export default new AuthController();
