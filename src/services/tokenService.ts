import db from '../db/db';

class TokenService {
  /**
   * Save a new token for a user
   */
  public async saveToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    // Delete any existing active tokens for this user
    await db('user_tokens').where({ user_id: userId, status: 'active' }).del();

    // Insert the new token
    await db('user_tokens').insert({
      user_id: userId,
      token,
      status: 'active',
      expires_at: expiresAt,
    });
  }

  /**
   * Revoke (blacklist) a token
   */
  public async blacklistToken(token: string): Promise<void> {
    await db('user_tokens').where({ token }).update({ status: 'blacklisted' });
  }

  /**
   * Check if a token is blacklisted or expired
   */
  public async isTokenValid(token: string): Promise<boolean> {
    const record = await db('user_tokens').where({ token }).first();

    if (!record) {
      return false;  // Token not found
    }

    if (record.status !== 'active') {
      return false;  // Token is blacklisted or expired
    }

    if (record.expires_at && new Date(record.expires_at) < new Date()) {
      return false;  // Token has expired
    }

    return true;
  }
}

export default new TokenService();
