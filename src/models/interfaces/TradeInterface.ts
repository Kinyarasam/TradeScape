export interface Trade {
  id: string;
  currencyPair: string;
  entryPrice: number;
  exitPrice?: number;
  status: 'open' | 'closed' | 'pending';
  createdAt: Date;
  updatedAt?: Date;
}
