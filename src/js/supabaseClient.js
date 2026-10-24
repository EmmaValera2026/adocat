import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Защита от создания дубликатов в глобальной области видимости браузера
if (typeof window !== 'undefined' && !window.__supabaseInstance) {
  window.__supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
}

// Экспортируем единый экземпляр для всего проекта
export const supabase = typeof window !== 'undefined' 
  ? window.__supabaseInstance 
  : createClient(supabaseUrl, supabaseAnonKey);