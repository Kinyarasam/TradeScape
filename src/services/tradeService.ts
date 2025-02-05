import TradeModel from '../models/TradeModel';
import { Trade } from '../models/interfaces/TradeInterface';

// Fetch all trades
export async function getAllTrades(): Promise<Trade[]> {
    return await TradeModel.getAll();
}

// Create a new trade
export async function createTrade(trade: Partial<Trade>): Promise<Trade> {
    return await TradeModel.create(trade);
}
