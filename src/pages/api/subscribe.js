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

    // 1. Проверяем наличие и базовую валидность email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return new Response(JSON.stringify({ message: 'El correu electrònic no és vàlid' }), { status: 400 });
    }

    // 2. Тщательно очищаем все данные от лишних пробелов и мусора
    const cleanEmail = email.trim().toLowerCase();
    const cleanNombre = nombre ? nombre.trim().replace(/\s+/g, ' ') : null;
    const cleanProvincia = provincia ? provincia.trim() : null;
    
    let cleanTelefono = null;
    if (telefono) {
      const digitsOnly = telefono.replace(/\D/g, '');
      if (digitsOnly.length >= 9) {
        cleanTelefono = digitsOnly.startsWith('34') ? `+${digitsOnly}` : `+34${digitsOnly}`;
      } else {
        cleanTelefono = telefono.trim();
      }
    }

    // 3. Сохраняем ПОЛНУЮ ИСТОРИЮ в Supabase (чистый .insert — каждая попытка создаёт новую запись)
    const { error: dbError } = await supabase
      .from('leads') 
      .insert([
        { 
          email: cleanEmail, 
          nombre: cleanNombre,
          telefono: cleanTelefono,
          provincia: cleanProvincia,
          modalidad_implicacion: role || 'butlleti',
          respuestas: respuestas || null,
          app_origen: 'adocat',
          created_at: new Date().toISOString()
        }
      ]);

    if (dbError) {
      console.error('❌ Error guardando historial en Supabase:', dbError.message);
    }

    const apiKey = import.meta.env.BREVO_API_KEY;
    const listId = Number(import.meta.env.BREVO_LIST_ID) || 3;
    const tutorEmail = import.meta.env.TUTOR_EMAIL || 'som.adocat@gmail.com';

    if (apiKey) {
      // --- ШАГ 4.1: Синхронизация контакта в Brevo ---
      try {
        let firstName = 'Docent';
        let lastName = '-';
        
        if (cleanNombre) {
          const parts = cleanNombre.split(/\s+/);
          firstName = parts[0] || 'Docent';
          lastName = parts.slice(1).join(' ') || '-';
        }

        const attributesObj = {
          NOMBRE: firstName,
          APELLIDOS: lastName,
          ULTIMA_ACTIVIDAD: new Date().toISOString().split('T')[0]
        };

        if (cleanTelefono) {
          attributesObj.SMS = cleanTelefono;
        }

        await fetch('https://api.brevo.com/v3/contacts', {
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
      } catch (contactErr) {
        console.error('⚠️ Ошибка синхронизации с Brevo:', contactErr);
      }

      // --- ШАГ 4.2: Приветственное письмо пользователю ---
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
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
                <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">Benvingut/da, <strong>${cleanNombre || 'docent'}</strong>.</p>
                <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Confirmem que la teva alta o actualització al butlletí oficial s'ha completat amb èxit.</p>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px;">ADOCAT — Associació de Docents Ocupacionals de Catalunya</p>
              </div>
            `
          })
        });
      } catch (mailErr) {
        console.error('❌ Ошибка отправки письма пользователю:', mailErr);
      }

      // --- ШАГ 4.3: Уведомление тьютору ---
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'ADOCAT Bot', email: 'som.adocat@gmail.com' },
            to: [{ email: tutorEmail }],
            subject: `🔔 Nou test completat: ${cleanNombre || cleanEmail}`,
            htmlContent: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; color: #111827;">
                <h3 style="color: #00bf63; border-bottom: 2px solid #111827; padding-bottom: 8px;">AVÍS DE NOU TEST / ACTUALITZACIÓ</h3>
                <p><strong>Nom:</strong> ${cleanNombre || 'No especificat'}</p>
                <p><strong>Email:</strong> ${cleanEmail}</p>
                <p><strong>Telèfon:</strong> ${cleanTelefono || 'No especificat'}</p>
                <p><strong>Província:</strong> ${cleanProvincia || 'No especificada'}</p>
                <p><strong>Rol / Modalitat:</strong> ${role || 'butlleti'}</p>
                <p><strong>Data:</strong> ${new Date().toLocaleString()}</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
                <p style="font-size: 13px; color: #4b5563;"><strong>Respostes:</strong><br>${JSON.stringify(respuestas, null, 2)}</p>
              </div>
            `
          })
        });
      } catch (tutorMailErr) {
        console.error('❌ Ошибка отправки уведомления тьютору:', tutorMailErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error('❌ Server Error:', err.message);
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
};