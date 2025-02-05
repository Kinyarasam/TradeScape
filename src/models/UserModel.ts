import db from '../db/db';
import { User } from './interfaces/UserInterface';

class UserModel {
  public async getUserById(id: number): Promise<User | null> {
    return await db<User>('users').where({ id }).first() || null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return await db<User>('users').where({ email }).first() || null;
  }

  public async createUser(user: Partial<User>): Promise<User> {
    const [newUser] = await db<User>('users').insert(user).returning('*');
    return newUser;
  }
}

export default new UserModel();
