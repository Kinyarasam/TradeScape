import UserModel from '../models/UserModel';
import { User } from '../models/interfaces/UserInterface';
import bcrypt from 'bcryptjs'; // Optional for password hashing

class UserService {
  /**
   * Get a user by their ID
   * @param userId - The user's ID
   */
  public async getUserById(userId: number): Promise<User | null> {
    return await UserModel.getUserById(userId);
  }

  /**
   * Get a user by their email (useful for login)
   * @param email - The user's email
   */
  public async getUserByEmail(email: string): Promise<User | null> {
    return await UserModel.getUserByEmail(email);
  }

  /**
   * Register a new user (with hashed password)
   * @param username - The user's username
   * @param email - The user's email
   * @param password - The user's password (plain text)
   */
  public async registerUser(username: string, email: string, password: string): Promise<User> {
    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.createUser({
      username,
      email,
      password_hash: hashedPassword,
    });

    const u: User = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      // password_hash: ""
    }
    return u;
  }

  /**
   * Authenticate a user (email/password validation)
   * @param email - The user's email
   * @param password - The user's password (plain text)
   */
  public async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await UserModel.getUserByEmail(email);

    if (!user) {
      return null;
    }
    
    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash === undefined ? "" : user.password_hash);
    return isMatch ? user : null;
  }
}

export default new UserService();
