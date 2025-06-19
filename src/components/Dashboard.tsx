import React, { useState, useEffect } from 'react';
import { Target, LogOut, Wallet, TrendingUp, TrendingDown, Minus, Calendar, DollarSign } from 'lucide-react';
import { User, Trade } from '../types';
import { auth } from '../utils/auth';
import { storage } from '../utils/storage';
import { TradeForm } from './TradeForm';
import { TradeHistory } from './TradeHistory';
import logo from '../assets/intent_new.png';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onShowWalletPrompt: () => void;
  onShowAnalyzePage: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onShowWalletPrompt, onShowAnalyzePage }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  useEffect(() => {
    loadTrades();
  }, [user.id]);

  const loadTrades = () => {
    const userTrades = storage.getTradesByUserId(user.id);
    setTrades(userTrades);
  };

  const handleTradeSubmit = (trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => {
    if (editingTrade) {
      // Update existing trade
      const updatedTrade: Trade = {
        ...trade,
        id: editingTrade.id,
        userId: user.id,
        createdAt: editingTrade.createdAt,
      };
      storage.saveTrade(updatedTrade);
      setEditingTrade(null);
    } else {
      // Create new trade
    const newTrade: Trade = {
      ...trade,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    storage.saveTrade(newTrade);
    }
    loadTrades();
    setShowTradeForm(false);
  };

  const handleDeleteTrade = (tradeId: string) => {
    storage.deleteTrade(tradeId);
    loadTrades();
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setShowTradeForm(true);
  };

  const handleCloseForm = () => {
    setShowTradeForm(false);
    setEditingTrade(null);
  };

  const calculateStats = () => {
    if (trades.length === 0) return { totalTrades: 0, winRate: 0, totalPnL: 0, avgConfidence: 0 };

    const totalTrades = trades.length;
    const wins = trades.filter(t => t.outcome === 'Hit TP').length;
    const winRate = (wins / totalTrades) * 100;
    
    const totalPnL = trades.reduce((sum, trade) => {
      const pnl = ((trade.exitMarketCap - trade.entryMarketCap) / trade.entryMarketCap) * trade.positionSize;
      return sum + pnl;
    }, 0);

    const avgConfidence = trades.reduce((sum, trade) => sum + trade.confidenceLevel, 0) / totalTrades;

    return { totalTrades, winRate, totalPnL, avgConfidence };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Intent Logo" className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Intent</h1>
                <p className="text-sm text-gray-400">Welcome back, {user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <button
                  onClick={onShowAnalyzePage}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
                >
                  Analyze Wallet
                </button>
              )}
              {user.walletAddress ? (
                <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                  <Wallet className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-mono">
                    {user.walletAddress.slice(0, 4)}...{user.walletAddress.slice(-4)}
                  </span>
                </div>
              ) : (
                <button
                  onClick={onShowWalletPrompt}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-600 rounded-lg hover:border-red-400 hover:text-red-400 transition-colors duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Trades</p>
                <p className="text-2xl font-bold">{stats.totalTrades}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold">{stats.winRate.toFixed(1)}%</p>
              </div>
              {stats.winRate >= 50 ? (
                <TrendingUp className="w-8 h-8 text-green-400" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-400" />
              )}
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total P&L (SOL)</p>
                <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.totalPnL >= 0 ? '+' : ''}{stats.totalPnL.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Confidence</p>
                <p className="text-2xl font-bold">{stats.avgConfidence.toFixed(1)}/5</p>
              </div>
              <Target className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowTradeForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Log New Trade
          </button>
        </div>

        {/* Trade History */}
        <TradeHistory 
          trades={trades} 
          onDeleteTrade={handleDeleteTrade}
          onEditTrade={handleEditTrade}
        />
      </div>

      {/* Trade Form Modal */}
      {showTradeForm && (
        <TradeForm
          onSubmit={handleTradeSubmit}
          onClose={handleCloseForm}
          editingTrade={editingTrade}
        />
      )}
    </div>
  );
};