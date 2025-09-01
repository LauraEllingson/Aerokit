// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Export a single Supabase client instance
export const supabase = (url && anon)
  ? createClient(url, anon, {
      auth: {
        persistSession: false,
        autoRefreshToken: true,
      },
    })
  : null;
