export interface TradeLog {
  id: string;
  userId: string;
  tokenSymbol: string;
  entryMarketCap: number;
  exitMarketCap: number;
  positionSize: number;
  confidenceLevel: number;
  outcome: 'Hit TP' | 'SL' | 'Paper Hands' | 'Still Holding';
  tradeReflection: string;
  createdAt: string;
  profit_loss_usd?: number;
  sol_price_usd?: number;
}