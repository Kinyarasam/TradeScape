import { Request, Response, NextFunction } from 'express';
import UserService from '../services/userService';

class UserController {
  public async registerUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log(req.body)
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
}

export default new UserController();
