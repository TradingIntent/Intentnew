import { User } from '../types';
import { supabase } from './supabaseClient';

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const auth = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          throw new AuthError('Invalid email or password');
        }
        throw new AuthError(error.message);
      }

      if (data.user) {
        // Get additional user data from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error('Failed to fetch user data:', userError);
          throw new AuthError('Failed to load user data');
        }

        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          walletAddress: userData.wallet,
        };

      return user;
    }
    
    return null;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error('Login error:', error);
      throw new AuthError('An unexpected error occurred during login');
    }
  },

  register: async (email: string, password: string): Promise<User> => {
    try {
      console.log('Starting registration process...');
      
      // Create auth user
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            email_confirmed: true
          }
        }
      });

      if (signupError) {
        console.error('Signup error:', signupError);
        if (signupError.message.includes('already registered')) {
          throw new AuthError('An account with this email already exists');
        }
        throw new AuthError(signupError.message);
      }

      if (!signupData.user) {
        console.error('No user data returned from signup');
        throw new AuthError('Failed to create user account');
      }

      console.log('Auth user created successfully:', signupData.user.id);

      // Create user record in our users table using upsert
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          id: signupData.user.id,  // This matches auth.uid()
          email: signupData.user.email,
          wallet: null
        })
        .select()
        .single();

      if (userError) {
        console.error('Failed to create user record:', userError);
        console.error('Error details:', {
          code: userError.code,
          message: userError.message,
          details: userError.details,
          hint: userError.hint
        });
        throw new AuthError('Failed to complete registration: ' + userError.message);
    }

      console.log('User record created successfully:', userData);

      // Sign in immediately after registration
      const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
        password,
      });

      if (loginError) {
        console.error('Auto-login error:', loginError);
        throw new AuthError('Account created but failed to sign in automatically. Please try logging in manually.');
      }

      console.log('Registration and auto-login completed successfully');

      return {
        id: signupData.user.id,
        email: signupData.user.email!,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error('Registration error:', error);
      throw new AuthError('An unexpected error occurred during registration');
    }
  },

  logout: async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new AuthError('Failed to log out');
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error('Logout error:', error);
      throw new AuthError('An unexpected error occurred during logout');
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw new AuthError('Failed to get current user');
      if (!user) return null;

      // Get additional user data from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error('Failed to fetch user data:', userError);
        throw new AuthError('Failed to load user data');
      }

      return {
        id: user.id,
        email: user.email!,
        walletAddress: userData.wallet,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error('Get current user error:', error);
      return null;
    }
  },

  updateUserWallet: async (userId: string, walletAddress: string): Promise<User | null> => {
    try {
      console.log('Attempting to update wallet for user:', userId, 'with address:', walletAddress);
      const { data, error } = await supabase
        .from('users')
        .update({ wallet: walletAddress })
        .eq('id', userId)
        .select();

      if (error) {
        console.error('Supabase error updating wallet:', error);
        if (error.code === '23505') {
          throw new AuthError('This wallet is already assigned to a different user.');
        }
        throw new AuthError('Failed to update wallet address: ' + error.message);
      }

      if (!data || data.length === 0) {
        console.error('Wallet update failed: No rows returned or updated.', data);
        throw new AuthError('Failed to update wallet address: User not found or update not permitted.');
      }

      const updatedUserData = data[0];

      console.log('Wallet updated successfully in DB:', updatedUserData);

      return {
        id: updatedUserData.id,
        email: updatedUserData.email,
        walletAddress: updatedUserData.wallet,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      console.error('Update wallet error:', error);
      throw new AuthError('An unexpected error occurred during wallet update');
    }
  },
};