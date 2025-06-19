export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          wallet_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          wallet_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          wallet_address?: string | null
          created_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          token_symbol: string
          entry_market_cap: number
          exit_market_cap: number
          position_size: number
          confidence_level: number
          outcome: 'Hit TP' | 'SL' | 'Paper Hands' | 'Still Holding'
          trade_reflection: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_symbol: string
          entry_market_cap: number
          exit_market_cap: number
          position_size: number
          confidence_level: number
          outcome: 'Hit TP' | 'SL' | 'Paper Hands' | 'Still Holding'
          trade_reflection: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_symbol?: string
          entry_market_cap?: number
          exit_market_cap?: number
          position_size?: number
          confidence_level?: number
          outcome?: 'Hit TP' | 'SL' | 'Paper Hands' | 'Still Holding'
          trade_reflection?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 