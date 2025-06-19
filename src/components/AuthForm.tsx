import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface AuthFormProps {
  onLogin: (user: { id: string; email: string; walletAddress: string }) => void;
}

export default function AuthForm({ onLogin }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        setError('Failed to load user.');
        return;
      }

      // Fetch wallet from users table
      const { data: walletData } = await supabase
        .from('users')
        .select('wallet')
        .eq('id', userData.user.id)
        .single();

      onLogin({
        id: userData.user.id,
        email: userData.user.email ?? '',
        walletAddress: walletData?.wallet ?? '',
      });
    } else {
      const { error } = await supabase.auth.signUp({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      // Delay to allow session to be established
      setTimeout(async () => {
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr || !userData?.user) {
          setError('Failed to load user after signup.');
          return;
        }

        onLogin({
          id: userData.user.id,
          email: userData.user.email ?? '',
          walletAddress: '',
        });
      }, 500);
    }
  };

  return (
    <div className="text-white p-6 bg-gray-900 rounded shadow">
      <h2 className="text-xl font-bold mb-2">{isLogin ? 'Login' : 'Sign Up'}</h2>
      <input
        className="block w-full mb-2 p-2 bg-gray-800 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="block w-full mb-2 p-2 bg-gray-800 rounded"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
        {isLogin ? 'Log In' : 'Sign Up'}
      </button>
      <p
        className="text-sm mt-3 cursor-pointer text-blue-400"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
      </p>
    </div>
  );
}
