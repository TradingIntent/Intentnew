import React, { useState } from 'react';
import { Wallet, X } from 'lucide-react';

interface WalletPromptProps {
  onWalletSubmit: (walletAddress: string) => void;
  onSkip: () => void;
  isModal?: boolean;
}

export const WalletPrompt: React.FC<WalletPromptProps> = ({ onWalletSubmit, onSkip, isModal = false }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress.trim()) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    onWalletSubmit(walletAddress.trim());
    setIsLoading(false);
  };

  const validateSolanaAddress = (address: string): boolean => {
    // Basic Solana address validation (base58, 32-44 characters)
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return solanaAddressRegex.test(address);
  };

  const isValidAddress = walletAddress.trim() && validateSolanaAddress(walletAddress.trim());

  return (
    <div className={`${isModal ? 'fixed inset-0 bg-black/80 backdrop-blur-sm' : 'min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900'} flex items-center justify-center p-4 z-50 text-white`}>
      <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full border border-gray-700 relative shadow-xl">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-300"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-blue-400" />
          <h2 className="text-2xl font-bold mb-2 text-white">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Add your Solana wallet address to track your trades and build your trading profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="wallet" className="block text-sm font-medium text-gray-300 mb-2">
              Solana Wallet Address
            </label>
            <input
              type="text"
              id="wallet"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 text-white ${
                walletAddress.trim() && !isValidAddress 
                  ? 'border-red-500' 
                  : 'border-gray-600'
              }`}
              placeholder="Enter your Solana wallet address"
            />
            {walletAddress.trim() && !isValidAddress && (
              <p className="text-red-400 text-sm mt-2">Please enter a valid Solana wallet address</p>
            )}
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={!isValidAddress || isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
            
            <button
              type="button"
              onClick={onSkip}
              className="w-full py-3 border border-gray-600 rounded-lg font-semibold hover:border-gray-500 transition-colors duration-300 text-gray-300 hover:text-white"
            >
              Skip for Now
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Your wallet address is stored locally and used only for trade tracking.
          </p>
        </div>
      </div>
    </div>
  );
}; 