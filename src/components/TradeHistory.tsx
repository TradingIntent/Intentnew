import React from 'react';
import { Trash2, TrendingUp, TrendingDown, Calendar, Target, Edit2 } from 'lucide-react';
import { Trade } from '../types';

interface TradeHistoryProps {
  trades: Trade[];
  onDeleteTrade: (tradeId: string) => void;
  onEditTrade: (trade: Trade) => void;
}

export const TradeHistory: React.FC<TradeHistoryProps> = ({ trades, onDeleteTrade, onEditTrade }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const calculatePnL = (trade: Trade) => {
    const pnlPercentage = ((trade.exitMarketCap - trade.entryMarketCap) / trade.entryMarketCap) * 100;
    const pnlAmount = (pnlPercentage / 100) * trade.positionSize;
    return { percentage: pnlPercentage, amount: pnlAmount };
  };

  const getOutcomeColor = (outcome: Trade['outcome']) => {
    switch (outcome) {
      case 'Hit TP':
        return 'text-green-400 bg-green-400/10';
      case 'SL':
        return 'text-red-400 bg-red-400/10';
      case 'Paper Hands':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'Still Holding':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (trades.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700 text-center">
        <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-xl font-semibold mb-2 text-gray-400">No trades logged yet</h3>
        <p className="text-gray-500">Start building your trading journal by logging your first trade.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trade History</h2>
        <span className="text-gray-400">{trades.length} trade{trades.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {trades.map((trade) => {
          const pnl = calculatePnL(trade);
          return (
            <div
              key={trade.id}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <span className="text-lg font-bold text-blue-400">{trade.tokenSymbol}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOutcomeColor(trade.outcome)}`}>
                        {trade.outcome}
                      </span>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Target className="w-4 h-4" />
                        <span>{trade.confidenceLevel}/5</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(trade.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditTrade(trade)}
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-300 p-2"
                    title="Edit trade"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                <button
                  onClick={() => onDeleteTrade(trade.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors duration-300 p-2"
                  title="Delete trade"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Entry MC</p>
                  <p className="font-semibold">{formatMarketCap(trade.entryMarketCap)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Exit MC</p>
                  <p className="font-semibold">{formatMarketCap(trade.exitMarketCap)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Position Size</p>
                  <p className="font-semibold">{trade.positionSize} SOL</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">P&L</p>
                  <div className="flex items-center space-x-2">
                    {pnl.percentage >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`font-semibold ${pnl.percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnl.percentage >= 0 ? '+' : ''}{pnl.percentage.toFixed(1)}%
                    </span>
                    <span className={`text-sm ${pnl.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ({pnl.amount >= 0 ? '+' : ''}{pnl.amount.toFixed(2)} SOL)
                    </span>
                  </div>
                </div>
              </div>

              {trade.tradeReflection && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-sm text-gray-300 leading-relaxed">{trade.tradeReflection}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};