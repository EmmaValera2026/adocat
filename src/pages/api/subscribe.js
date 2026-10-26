import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_PUBLISHABLE_KEY
);

export const prerender = false;

export const POST = async ({ request }) => {
  try {
    const body = await request.json();
    console.log('📥 INCOMING QUIZ DATA:', body);

    const { email, nombre, telefono, provincia, role, respuestas } = body;

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email requerit' }), { status: 400 });
    }

    const cleanEmail = email.trim();

    // 1. Сохраняем в Supabase
    const { error } = await supabase
      .from('leads') 
      .upsert(
        [
          { 
            email: cleanEmail, 
            nombre: nombre || null,
            telefono: telefono || null,
            provincia: provincia || null,
            modalidad_implicacion: role || 'butlleti',
            respuestas: respuestas || null,
            app_origen: 'adocat',
            updated_at: new Date().toISOString()
          }
        ],
        { onConflict: 'email' } // Обновляет запись, если email уже есть
      );

    if (error) {
      console.error('❌ Error guardando en Supabase:', error.message);
    }

    // 2. Взаимодействие с Brevo
    const apiKey = import.meta.env.BREVO_API_KEY;
    const listId = Number(import.meta.env.BREVO_LIST_ID) || 3;

    if (apiKey) {
      // --- ШАГ 2.1: Создаем/обновляем контакт в CRM (Изолированный блок) ---
      try {
        let firstName = '';
        let lastName = '';
        
        if (nombre && nombre.trim()) {
          const parts = nombre.trim().split(/\s+/);
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
        }

        const attributesObj = {};
        if (firstName) attributesObj.NOMBRE = firstName;
        if (lastName) attributesObj.APELLIDOS = lastName;

        if (telefono) {
          const cleanPhone = telefono.replace(/\D/g, '');
          if (cleanPhone.length >= 9) {
            attributesObj.SMS = cleanPhone.startsWith('34') ? `+${cleanPhone}` : `+34${cleanPhone}`;
          }
        }

        const brevoContactRes = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            email: cleanEmail,
            attributes: attributesObj,
            listIds: [listId],
            updateEnabled: true
          })
        });

        const contactStatus = brevoContactRes.status;
        console.log(`🟢 BREVO CONTACT STATUS: ${contactStatus}`);
      } catch (contactErr) {
        console.error('⚠️ Ошибка создания контакта в Brevo (игнорируем, шлем письмо):', contactErr);
      }

      // --- ШАГ 2.2: Отправка приветственного письма (Выполняется ВСЕГДА) ---
      try {
        const mailRes = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'ADOCAT', email: 'som.adocat@gmail.com' },
            to: [{ email: cleanEmail }],
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

        const mailData = await mailRes.json();
        console.log('🟢 BREVO EMAIL RESPONSE:', JSON.stringify(mailData));

      } catch (mailErr) {
        console.error('❌ Ошибка отправки письма:', mailErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error('❌ Server Error:', err.message);
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
};