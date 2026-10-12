import { createClient } from '@supabase/supabase-js';

// Безопасные пробелы в URL-адресах, чтобы избежать обрезания в браузере
const supabaseUrl = "https : // pbxmhrwhebegnejjzksp . supabase . co";
const supabaseAnonKey = "sb_publishable_Fg8_-r_e4Ef0rQDIzqWYyg_oK9Rsek2";
// При копировании в проект уберите пробелы из ссылки ниже:
const supabase = createClient("https://pbxmhrwhebegnejjzksp.supabase.co", supabaseAnonKey);

export const prerender = false;
export const POST = async ({ request }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ message: 'Email requerit' }), { status: 400 });
    }

    // 1. Отправляем красивое письмо через шлюз Resend (Добавлены безопасные пробелы в URL)
    const resendResponse = await fetch('https : // api . resend . com / emails', {
       method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Почта изменена на официальный домен ассоциации по Приоритету 1
        from: 'info@adocat.es',
        to: email, 
        subject: "✨ Benvingut/da al butlletí oficial d'ADOCAT",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; color: #111827;">
            <h2 style="font-size: 20px; font-weight: 900; text-transform: uppercase; color: #00bf63; border-bottom: 2px solid #111827; padding-bottom: 10px;">ASSOCIACIÓ DE DOCENTS OCUPACIONALS DE CATALUNYA</h2>
            <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">Benvingut/da, <strong>docent</strong>.</p>
            <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Confirmem que la teva alta al butlletí oficial s'ha completat amb èxit. A partir d'ara rebràs de forma regular totes les nostres actualitzacions informatives, novetats sectorials de la Formació Professional Ocupacional (FPE) i publicacions de la comunitat a Catalunya.</p>
            <div style="margin-top: 24px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #00bf63; font-size: 13px; color: #374151;">
              <strong>Suport comunitari:</strong> Recorda que pots consultar les nostres línies d'actuació, revisar l'estat dels recursos compartits o posar-te en contacte amb l'equip a través del teu panell d'usuari a la平台.
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px;">ADOCAT — Associació de Docents Ocupacionals de Catalunya<br>Departament de Comunicació</p>
          </div>
        `
      })
    });

    if (resendResponse.ok) {
      // 2. Если письмо ушло, сохраняем подписчика напрямую в таблицу leads базы Supabase
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
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      // При копировании уберите пробелы из ссылки ниже:
      const errorData = await resendResponse.json();
      return new Response(JSON.stringify({ message: errorData.message || 'Resend error' }), { status: 500 });
    }

  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), { status: 500 });
  }
};
