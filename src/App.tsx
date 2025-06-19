import React, { useState, useEffect } from 'react';
import { Target, BarChart3, Brain, TrendingUp, Twitter, Mail, FileText, X, Eye, EyeOff } from 'lucide-react';
import { User } from './types';
import { auth, AuthError } from './utils/auth';
import { WalletPrompt } from './components/WalletPrompt';
import { Dashboard } from './components/Dashboard';
import { FaWallet } from 'react-icons/fa';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AnalyzePage } from './pages/AnalyzePage';
import logo from './assets/intent_new.png';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [walletErrorMessage, setWalletErrorMessage] = useState('');
  const [isSignupFlow, setIsSignupFlow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Failed to get current user:", error);
      }
    };
    checkUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const user = await auth.login(email, password);
        if (user) {
          setUser(user);
          setIsModalOpen(false);
        }
      } else {
        const user = await auth.register(email, password);
        if (user) {
          setUser(user);
          setIsModalOpen(false);
          setIsSignupFlow(true);
          setShowWalletPrompt(true);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setShowPassword(false);
  };

  const handleWalletSubmit = async (walletAddress: string) => {
    console.log('Attempting to connect wallet...');
    if (!user || !walletAddress.trim()) {
      console.log('User or wallet address is missing. User:', user, 'Wallet Address:', walletAddress);
      return;
    }

    try {
      console.log('Calling updateUserWallet with userId:', user.id, 'and walletAddress:', walletAddress.trim());
      const updatedUser = await auth.updateUserWallet(user.id, walletAddress.trim());
      if (updatedUser) {
        console.log('Wallet updated successfully. Updated user:', updatedUser);
        setUser(updatedUser);
        setShowWalletPrompt(false);
        setWalletAddress('');
        setIsSignupFlow(false);
      } else {
        console.log('updateUserWallet returned null or undefined');
        setWalletErrorMessage('Failed to update wallet address: No user returned');
        setShowErrorPopup(true);
      }
    } catch (error) {
      console.error('Error updating wallet address:', error);
      if (error instanceof AuthError) {
        setWalletErrorMessage(error.message);
      } else {
        setWalletErrorMessage('An unexpected error occurred during wallet update.');
      }
      setShowErrorPopup(true);
    }
  };

  const handleWalletSkip = () => {
    setShowWalletPrompt(false);
    setIsSignupFlow(false);
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleShowWalletPrompt = () => {
    setShowWalletPrompt(true);
  };

  const handleShowAnalyzePage = () => {
    navigate('/analyze');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white overflow-hidden">
        {/* Routes for main content */}
        <Routes>
          <Route path="/analyze" element={<AnalyzePage user={user} />} />
          <Route path="/" element={
            <>
              {user && isSignupFlow && !user.walletAddress && (
                <WalletPrompt
                  onWalletSubmit={handleWalletSubmit}
                  onSkip={handleWalletSkip}
                  isModal={false}
                />
              )}
              {user && (!isSignupFlow || user.walletAddress) ? (
                <Dashboard
                  user={user}
                  onLogout={handleLogout}
                  onShowWalletPrompt={handleShowWalletPrompt}
                  onShowAnalyzePage={handleShowAnalyzePage}
                />
              ) : (
                <div className="min-h-screen">
                  {/* Original Landing Page Content */} 
                  <div className="relative min-h-screen flex items-center justify-center px-4">
                    {/* Background Elements */}
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>

                    {/* Hero Content */}
                    <div className="relative z-10 text-center max-w-4xl mx-auto">
                      <div className="mb-8">
                        <img src={logo} alt="Intent Logo" className="w-32 h-32 mx-auto mb-6" />
                      </div>

                      <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent leading-tight">
                        Track Your Plays.<br />
                        <span className="text-blue-400">Refine Your Aura.</span>
                      </h1>
                      
                      <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Post-trade discipline journaling for crypto traders.<br />
                        Build your edge through reflection.
                      </p>

                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                      >
                        <span className="relative z-10">Launch Dashboard</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                      </button>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                      <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* How It Works Section */}
                  <section className="py-20 px-4 relative">
                    <div className="max-w-6xl mx-auto">
                      <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h2>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                          Three simple steps to transform your trading discipline
                        </p>
                      </div>

                      <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                          <div className="absolute -top-4 left-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            Step 1
                          </div>
                          <div className="mb-6">
                            <BarChart3 className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <h3 className="text-2xl font-bold mb-4">Log Your Play</h3>
                          <p className="text-gray-300 leading-relaxed">
                            Record your trade details after it ends. No emotion, just facts. Entry, exit, size, and reasoning.
                          </p>
                        </div>

                        {/* Step 2 */}
                        <div className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                          <div className="absolute -top-4 left-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            Step 2
                          </div>
                          <div className="mb-6">
                            <TrendingUp className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <h3 className="text-2xl font-bold mb-4">Rate & Reflect</h3>
                          <p className="text-gray-300 leading-relaxed">
                            Score your confidence and outcome. Rate your process, not just the P&L. Build self-awareness.
                          </p>
                        </div>

                        {/* Step 3 */}
                        <div className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
                          <div className="absolute -top-4 left-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            Step 3
                          </div>
                          <div className="mb-6">
                            <Brain className="w-12 h-12 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                          <h3 className="text-2xl font-bold mb-4">Learn & Grow</h3>
                          <p className="text-gray-300 leading-relaxed">
                            Analyze patterns, identify mistakes, and build discipline. Turn losses into lessons, wins into wisdom.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Footer */}
                  <footer className="bg-black/50 backdrop-blur-sm border-t border-gray-800 py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                      <div className="text-center mb-8">
                        <p className="text-2xl font-bold text-gray-300 mb-2">
                          "No plan, no entry. No reflection, no growth."
                        </p>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                          <img src={logo} alt="Intent Logo" className="w-6 h-6" />
                          <span className="text-lg font-semibold">Intent</span>
                        </div>
                        
                        <div className="flex items-center space-x-8">
                          <a href="https://tradingintent.com/IntentWhitepaperV1.0.1.pdf" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>Whitepaper</span>
                          </a>
                          <a href="https://x.com/TradingIntent" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>Contact</span>
                          </a>
                          <a href="https://x.com/TradingIntent" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center space-x-2">
                            <Twitter className="w-4 h-4" />
                            <span>Twitter</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </footer>
                </div>
              )}
            </>
          } />
        </Routes>

        {/* Login/Register Modal - Always rendered at top level */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full border border-gray-700 relative">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center mb-8">
                <img src={logo} alt="Intent Logo" className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  {isLogin ? 'Welcome Back' : 'Join Intent'}
                </h2>
                <p className="text-gray-400">
                  {isLogin ? 'Sign in to your account' : 'Create your account'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 pr-12"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    isLoading
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                  }`}
                >
                  {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Register')}
                </button>
              </form>

              <p className="text-center text-gray-400 text-sm mt-6">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-blue-400 hover:underline"
                >
                  {isLogin ? 'Register' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Error Popup Modal */}
        {showErrorPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-[#181F2A] rounded-2xl p-8 max-w-sm w-full shadow-xl relative text-center">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-xl"
                onClick={() => setShowErrorPopup(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <div className="flex flex-col items-center mb-6">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 animate-bounce-slow mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
                <p className="text-gray-400 text-md">
                  {walletErrorMessage}
                </p>
              </div>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="w-full py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* Common Wallet Prompt Modal (for dashboard triggered) */}
        {user && showWalletPrompt && (
          <WalletPrompt
            onWalletSubmit={handleWalletSubmit}
            onSkip={handleWalletSkip}
            isModal={true}
          />
        )}
    </div>
  );
}

export default App;