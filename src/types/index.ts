export interface User {
  id: string;
  email: string;
  walletAddress?: string;
}

export interface Trade {
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
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}