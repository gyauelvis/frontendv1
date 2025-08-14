
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';


export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  })

        



export interface User {
    id: string;
    email: string;
    password_hash: string;
    phone_number: string;
    first_name: string;
    last_name: string;
    date_of_birth?: Date;
    kyc_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
    kyc_verified_at?: Date;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface Account {
    id: string;
    user_id: string;
    account_number: string;
    balance: number;
    available_balance: number;
    currency: string;
    account_type: 'PERSONAL' | 'BUSINESS';
    status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
    created_at: Date;
    updated_at: Date;
}

export interface UserBiometric {
    id: string;
    user_id: string;
    credential_id: string;
    public_key: string;
    counter: number;
    device_name?: string;
    created_at: Date;
    last_used_at?: Date;
}

export interface UserMfa {
    id: string;
    user_id: string;
    method: 'TOTP' | 'SMS' | 'EMAIL';
    secret?: string;
    is_enabled: boolean;
    backup_codes: string[];
    created_at: Date;
    updated_at: Date;
}