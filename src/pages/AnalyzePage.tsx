import React, { useState, useEffect } from 'react';
import { openaiService } from '../services/openai';
import { TradeLog } from '../types/tradeLog';
import { Loader2, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';

interface AnalyzePageProps {
  user: User | null;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ user }) => {
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitiatedAnalysis, setHasInitiatedAnalysis] = useState(false);
  const [notEnoughDataError, setNotEnoughDataError] = useState<string | null>(null);
  const navigate = useNavigate();

  const cleanMarkdown = (text: string) => {
    if (!text) return '';
    let cleanedText = text.replace(/###\s?/g, '');
    cleanedText = cleanedText.replace(/\*\*\s?/g, '');
    cleanedText = cleanedText.replace(/^- /, '\n').replace(/\n- /, '\n');
    return cleanedText.trim();
  };

  useEffect(() => {
    const fetchTradeLogs = async () => {
      if (!user) {
        setIsLoading(false);
        setError('Please log in to view your trading analysis.');
        return;
      }

      try {
        const logs = storage.getTradesByUserId(user.id);
        setTradeLogs(logs);
        
        if (logs.length > 0) {
          const summary = logs.map(log => 
            `Date: ${new Date(log.createdAt).toLocaleDateString()}, Details: ${log.tradeReflection}`
          ).join('\n');
          
          const aiAnalysis = await openaiService.analyzeTradingBehavior(summary);
          setAnalysis(aiAnalysis);
        } else {
          setAnalysis(null);
        }

      } catch (err) {
        console.error('Error analyzing trade logs:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTradeLogs();
  }, [user]);

  const handleAnalyzeClick = async () => {
    setHasInitiatedAnalysis(true);
    setNotEnoughDataError(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(true);

    if (!user) {
      setError('Please log in to analyze your trading behavior.');
      setIsLoading(false);
      return;
    }

    if (tradeLogs.length < 3) {
      setNotEnoughDataError('Not enough data logged: there must be a minimum of 3 trades logged for the analysis to work.');
      setIsLoading(false);
      return;
    }

    try {
      const summary = tradeLogs.map(log => {
        const entryMC = log.entryMarketCap !== undefined ? `Entry MC: $${log.entryMarketCap}` : '';
        const exitMC = log.exitMarketCap !== undefined ? `Exit MC: $${log.exitMarketCap}` : '';
        const profitLoss = log.profit_loss_usd !== undefined ? `P&L: $${log.profit_loss_usd.toFixed(2)}` : '';
        const confidence = log.confidenceLevel !== undefined ? `Confidence: ${log.confidenceLevel}/5` : '';
        const outcome = log.outcome ? `Outcome: ${log.outcome}` : '';

        return `Trade Date: ${new Date(log.createdAt).toLocaleDateString()}, Ticker: ${log.tokenSymbol}, Position Size: ${log.positionSize}, ${entryMC}, ${exitMC}, ${profitLoss}, ${confidence}, ${outcome}, Reflection: ${log.tradeReflection || 'N/A'}`;
      }).join('\n');

      const aiAnalysis = await openaiService.analyzeTradingBehavior(summary);
      setAnalysis(aiAnalysis);
    } catch (err) {
      console.error('Error getting OpenAI analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to get AI analysis. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex flex-col items-center justify-center min-h-[150px] mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-400 hover:text-white transition-colors duration-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold mb-4 py-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 leading-normal">
            Personalized Trading Analysis
          </h1>
        </div>

        {!hasInitiatedAnalysis && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-blue-400" />
            <h2 className="text-2xl font-bold mb-4 text-white">Analyze Your Trade Behaviors</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              With more data you inject into Intent, it will analyze your trade behaviors, identify patterns, and provide personalized insights to help you improve.
            </p>
            <button
              onClick={handleAnalyzeClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              Analyze My Behaviors
            </button>
          </div>
        )}

        {hasInitiatedAnalysis && isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-4" />
            <p className="text-gray-300">Gathering your trade data and generating insights...</p>
          </div>
        )}

        {hasInitiatedAnalysis && error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <div>
              <h2 className="text-xl font-bold text-red-300 mb-2">Analysis Error</h2>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {hasInitiatedAnalysis && notEnoughDataError && (
          <div className="bg-yellow-900/50 border border-yellow-500 rounded-lg p-6 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-xl font-bold text-yellow-300 mb-2">Not Enough Data</h2>
              <p className="text-yellow-200">{notEnoughDataError}</p>
            </div>
          </div>
        )}

        {hasInitiatedAnalysis && !isLoading && !error && !notEnoughDataError && analysis && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 relative overflow-hidden">
            {/* Glassy background elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animation-delay-700"></div>
            </div>
            {/* Gradient border effect */}
            <div className="absolute inset-0 rounded-xl pointer-events-none"
                 style={{ background: 'linear-gradient(to right, #4F46E5, #9333EA), linear-gradient(to bottom, #4F46E5, #9333EA)', padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor' }}
            ></div>

            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">AI Trading Thesis</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-line leading-relaxed">{analysis ? cleanMarkdown(analysis) : ''}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}; 