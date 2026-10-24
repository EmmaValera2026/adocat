import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_PUBLISHABLE_KEY
);

export const prerender = false;

export const GET = async () => {
  try {
    // Делаем самый легкий запрос к таблице leads, чтобы разбудить базу
    const { data, error } = await supabase.from('leads').select('id').limit(1);

    if (error) throw error;

    return new Response(JSON.stringify({ status: 'ok', message: 'Supabase is awake!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};