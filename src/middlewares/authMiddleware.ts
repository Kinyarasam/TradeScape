import { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import TokenService from '../services/tokenService';

interface Request extends ExpressRequest {
  user?: {
    userId: string;
  };
}


const redisClient = new Redis();

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

      // Check if token is blacklisted in Redis
      const isBlacklisted = await redisClient.get(`blacklisted_token:${token}`);
      if (isBlacklisted) {
          res.status(403).json({ error: 'Token has been revoked.' });
          return;
      }
  
      // Fallback to database check if Redis has no info
      const isValidInDb = await TokenService.isTokenValid(token);
      if (!isValidInDb) {
          res.status(403).json({ error: 'Invalid or expired token.' });
          return;
      }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as { userId: string };
        req.user = payload;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    }
}
