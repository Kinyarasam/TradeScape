import {v4 as uuidv4 } from 'uuid';
import db from '../db/db';
import { User } from './interfaces/UserInterface';

class UserModel {
  public async getUserById(id: string): Promise<User | null> {
    return await db<User>('users').where({ id }).first() || null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    return await db<User>('users').where({ email }).first() || null;
  }

  public async createUser(user: Partial<User>): Promise<User> {
    user.id = uuidv4();

    const [newUser] = await db<User>('users').insert(user).returning('*');
    return newUser;
  }

  public async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await db('users').where({ id: userId }).update({ password_hash: newPasswordHash });
  }
}

export default new UserModel();
