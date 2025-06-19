import { User, Trade } from '../types';

const USERS_KEY = 'tradingintent_users';
const TRADES_KEY = 'tradingintent_trades';
const CURRENT_USER_KEY = 'tradingintent_current_user';

export const storage = {
  // User management
  saveUser: (user: User): void => {
    const users = storage.getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getUsers: (): User[] => {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  getUserByEmail: (email: string): User | null => {
    const users = storage.getUsers();
    return users.find(u => u.email === email) || null;
  },

  getUserById: (id: string): User | null => {
    const users = storage.getUsers();
    return users.find(u => u.id === id) || null;
  },

  // Current user session
  setCurrentUser: (user: User): void => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  clearCurrentUser: (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Trade management
  saveTrade: (trade: Trade): void => {
    const trades = storage.getTrades();
    const existingIndex = trades.findIndex(t => t.id === trade.id);
    
    if (existingIndex >= 0) {
      trades[existingIndex] = trade;
    } else {
      trades.push(trade);
    }
    
    localStorage.setItem(TRADES_KEY, JSON.stringify(trades));
  },

  getTrades: (): Trade[] => {
    const trades = localStorage.getItem(TRADES_KEY);
    return trades ? JSON.parse(trades) : [];
  },

  getTradesByUserId: (userId: string): Trade[] => {
    const trades = storage.getTrades();
    return trades.filter(t => t.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  deleteTrade: (tradeId: string): void => {
    const trades = storage.getTrades();
    const filteredTrades = trades.filter(t => t.id !== tradeId);
    localStorage.setItem(TRADES_KEY, JSON.stringify(filteredTrades));
  }
};