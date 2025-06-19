import React, { useState, useEffect } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { Trade } from '../types';

interface TradeFormProps {
  onSubmit: (trade: Omit<Trade, 'id' | 'userId' | 'createdAt'>) => void;
  onClose: () => void;
  editingTrade: Trade | null;
}

export const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, onClose, editingTrade }) => {
  const [formData, setFormData] = useState({
    tokenSymbol: '',
    entryMarketCap: '',
    exitMarketCap: '',
    positionSize: '',
    confidenceLevel: 3,
    outcome: 'Still Holding' as Trade['outcome'],
    tradeReflection: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTrade) {
      setFormData({
        tokenSymbol: editingTrade.tokenSymbol,
        entryMarketCap: editingTrade.entryMarketCap.toString(),
        exitMarketCap: editingTrade.exitMarketCap.toString(),
        positionSize: editingTrade.positionSize.toString(),
        confidenceLevel: editingTrade.confidenceLevel,
        outcome: editingTrade.outcome,
        tradeReflection: editingTrade.tradeReflection,
      });
    }
  }, [editingTrade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const trade = {
      tokenSymbol: formData.tokenSymbol.toUpperCase(),
      entryMarketCap: parseFloat(formData.entryMarketCap),
      exitMarketCap: parseFloat(formData.exitMarketCap),
      positionSize: parseFloat(formData.positionSize),
      confidenceLevel: formData.confidenceLevel,
      outcome: formData.outcome,
      tradeReflection: formData.tradeReflection,
    };

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    onSubmit(trade);
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = 
    formData.tokenSymbol.trim() &&
    formData.entryMarketCap &&
    formData.exitMarketCap &&
    formData.positionSize &&
    formData.tradeReflection.trim();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full border border-gray-700 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <TrendingUp className="w-10 h-10 mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2">
            {editingTrade ? 'Edit Trade' : 'Log Your Trade'}
          </h2>
          <p className="text-gray-400">
            {editingTrade ? 'Update your trade details and reflection' : 'Record your trade details and reflect on your performance'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-300 mb-2">
                Token Symbol
              </label>
              <input
                type="text"
                id="tokenSymbol"
                value={formData.tokenSymbol}
                onChange={(e) => handleInputChange('tokenSymbol', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                placeholder="e.g., SOL, BONK"
                required
              />
            </div>

            <div>
              <label htmlFor="positionSize" className="block text-sm font-medium text-gray-300 mb-2">
                Position Size (SOL)
              </label>
              <input
                type="number"
                id="positionSize"
                step="0.01"
                value={formData.positionSize}
                onChange={(e) => handleInputChange('positionSize', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="entryMarketCap" className="block text-sm font-medium text-gray-300 mb-2">
                Entry Market Cap ($)
              </label>
              <input
                type="number"
                id="entryMarketCap"
                value={formData.entryMarketCap}
                onChange={(e) => handleInputChange('entryMarketCap', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                placeholder="1000000"
                required
              />
            </div>

            <div>
              <label htmlFor="exitMarketCap" className="block text-sm font-medium text-gray-300 mb-2">
                Exit Market Cap ($)
              </label>
              <input
                type="number"
                id="exitMarketCap"
                value={formData.exitMarketCap}
                onChange={(e) => handleInputChange('exitMarketCap', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                placeholder="2000000"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="confidenceLevel" className="block text-sm font-medium text-gray-300 mb-2">
                Confidence Level: {formData.confidenceLevel}/5
              </label>
              <input
                type="range"
                id="confidenceLevel"
                min="1"
                max="5"
                value={formData.confidenceLevel}
                onChange={(e) => handleInputChange('confidenceLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            <div>
              <label htmlFor="outcome" className="block text-sm font-medium text-gray-300 mb-2">
                Outcome
              </label>
              <select
                id="outcome"
                value={formData.outcome}
                onChange={(e) => handleInputChange('outcome', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
              >
                <option value="Hit TP">Hit TP</option>
                <option value="SL">SL</option>
                <option value="Paper Hands">Paper Hands</option>
                <option value="Still Holding">Still Holding</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tradeReflection" className="block text-sm font-medium text-gray-300 mb-2">
              Trade Reflection
            </label>
            <textarea
              id="tradeReflection"
              rows={4}
              value={formData.tradeReflection}
              onChange={(e) => handleInputChange('tradeReflection', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 resize-none"
              placeholder="What went well? What could be improved? Key learnings from this trade..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting 
              ? 'Saving...' 
              : editingTrade 
                ? 'Save Changes' 
                : 'Save Trade Log'}
          </button>
        </form>
      </div>
    </div>
  );
};