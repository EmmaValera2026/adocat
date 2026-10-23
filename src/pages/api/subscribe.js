import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_PUBLISHABLE_KEY
);

export const prerender = false;

export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('📥 INCOMING QUIZ DATA:', body); // Лог входящих данных для проверки

    const { email, nombre, telefono, provincia, role, respuestas } = body;

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email requerit' }), { status: 400 });
    }

    // 1. Сохраняем полный набор данных в Supabase
    const { error } = await supabase
      .from('leads') 
      .insert([
        { 
          email: email, 
          nombre: nombre || null,
          telefono: telefono || null,
          provincia: provincia || null,
          modalidad_implicacion: role || 'butlleti',
          respuestas: respuestas || null,
          app_origen: 'adocat',
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('❌ Error guardando en Supabase:', error.message);
    }

    // 2. Добавляем в Brevo
    const apiKey = import.meta.env.BREVO_API_KEY;
    const listId = Number(import.meta.env.BREVO_LIST_ID) || 3;

    if (apiKey) {
      try {
        // Разделяем имя и фамилию
        let firstName = '';
        let lastName = '';
        
        if (nombre) {
          const parts = nombre.trim().split(/\s+/);
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
        }

        const attributesObj = {};
        if (firstName) attributesObj.NOMBRE = firstName;
        if (lastName) attributesObj.APELLIDOS = lastName;

        // Форматирование телефона только если он из 9+ цифр
        if (telefono) {
          const cleanPhone = telefono.replace(/\D/g, '');
          if (cleanPhone.length >= 9) {
            attributesObj.SMS = cleanPhone.startsWith('34') ? `+${cleanPhone}` : `+34${cleanPhone}`;
          }
        }

        console.log('📤 SENDING TO BREVO ATTRIBUTES:', attributesObj);

        const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            attributes: attributesObj,
            listIds: [listId],
            updateEnabled: true
          })
        });

        const brevoData = await brevoRes.json();
        console.log('🟢 BREVO CONTACT RESPONSE:', JSON.stringify(brevoData));

        // 3. Отправка приветственного транзакционного письма
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'ADOCAT', email: 'som.adocat@gmail.com' },
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
        console.error('❌ Brevo error:', mailErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error('❌ Server Error:', err.message);
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
};