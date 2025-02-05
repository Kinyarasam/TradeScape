import db from '../db/db';
import { Trade } from './interfaces/TradeInterface';

class TradeModel {
  public async getAll(): Promise<Trade[]> {
    return await db<Trade>('trades').select('*').orderBy('created_at', 'desc');
  }

  public async create(trade: Partial<Trade>): Promise<Trade> {
    const [newTrade] = await db<Trade>('trades').insert(trade).returning('*');
    return newTrade;
  }

  public async update(id: number, updates: Partial<Trade>): Promise<Trade | null> {
    const [updatedTrade] = await db<Trade>('trades').where({ id }).update(updates).returning('*');
    return updatedTrade || null;
  }

  public async delete(id: number): Promise<void> {
    await db('trades').where({ id }).del();
  }
}

export default new TradeModel();
