import { createClient } from '@supabase/supabase-js';

// URL mockadas temporariamente. Em produção (ou após setup do Supabase) 
// elas devem ser providenciadas no arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-xyz.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key-12345';

/**
 * Cliente central do Supabase. Utilizado pelas rotas do Client (Browser)
 * ou processos de API normais.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
