import { Request, Response, NextFunction } from 'express';
import { getAllTrades, createTrade } from '../services/tradeService';
import { logError } from '../utils/logError';

class TradeController {
  // Fetch all trades
  public async fetchTrades(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trades = await getAllTrades();
      console.log(trades)
      res.json(trades);
    } catch (error) {
      logError('Error fetching trades', error);
      next(error);
    }
  }

  // Create a new trade
  public async addTrade(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currencyPair, entryPrice } = req.body;

      // Validate input
      if (!currencyPair || !entryPrice) {
        res.status(400).json({ error: 'currencyPair and entryPrice are required.' });
        return;
      }

      const newTrade = await createTrade({ currencyPair, entryPrice, status: 'open' });
      res.status(201).json(newTrade);
    } catch (error) {
      logError("Error adding trade", error);
      next(error);
    }
  }
}

export default new TradeController();
