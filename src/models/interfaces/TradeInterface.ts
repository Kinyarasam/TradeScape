export interface Trade {
  id: number;
  currencyPair: string;
  entryPrice: number;
  exitPrice?: number;
  status: 'open' | 'closed' | 'pending';
  createdAt: Date;
  updatedAt?: Date;
}
