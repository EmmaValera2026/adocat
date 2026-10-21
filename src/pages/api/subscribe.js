import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

export const prerender = false;

export const POST = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email requerit' }), { status: 400 });
    }

    // 1. Главное: сохраняем подписчика в таблицу leads нового Supabase
    const { error } = await supabase
      .from('leads') 
      .insert([
        { 
          email: email, 
          app_origen: 'adocat',
          modalidad_implicacion: 'butlleti',
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error guardando en Supabase:', error.message);
      return new Response(JSON.stringify({ message: error.message }), { status: 500 });
    }

    // 2. Попытка отправить письмо через Brevo (сработает только тогда, когда вы добавите BREVO_API_KEY)
    if (process.env.BREVO_API_KEY) {
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'ADOCAT', email: 'som.adocat.team@gmail.com' },
            to: [{ email: email }],
            subject: "✨ Benvingut/da al butlletí oficial d'ADOCAT",
            htmlContent: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; color: #111827;">
                <h2 style="font-size: 20px; font-weight: 900; text-transform: uppercase; color: #00bf63; border-bottom: 2px solid #111827; padding-bottom: 10px;">ASSOCIACIÓ DE DOCENTS OCUPACIONALS DE CATALUNYA</h2>
                <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">Benvingut/da, <strong>docent</strong>.</p>
                <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Confirmem que la teva alta al butlletí oficial s'ha completat amb èxit. A partir d'ara rebràs de forma regular totes les nostres actualitzacions informatives.</p>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px;">ADOCAT — Associació de Docents Ocupacionals de Catalunya</p>
              </div>
            `
          })
        });
      } catch (mailErr) {
        // Ошибка почты не блокирует сохранение пользователя в базу
        console.error('Brevo error (non-blocking):', mailErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
};