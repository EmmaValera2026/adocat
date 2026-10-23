import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

let supabase;
// Инклюзивное дефолтное имя по Приоритету 3 (Пункт 13)
let currentUserName = "DOCENT DE LA COMUNITAT"; 

if (typeof window !== 'undefined') {
  // 1. Инициализируем клиент Supabase один раз в браузере
  if (!window.supabaseClient) {
    window.supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  supabase = window.supabaseClient;

  // 2. Ждем, пока браузер полностью построит HTML-дерево (DOM)
  document.addEventListener('DOMContentLoaded', () => {

    // 3. Объявляем ВСЕ константы DOM один раз в самом верху. Теперь они яркие и активные!
    const authContainer = document.getElementById('auth-container');
    const profileContainer = document.getElementById('profile-container');
    const userWelcome = document.getElementById('user-welcome');
    const userIdEl = document.getElementById('user-id');
    const userEmailEl = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');

    const authForm = document.getElementById('auth-form');
    const authError = document.getElementById('auth-error');

    const registerFormAdocat = document.getElementById('user-register-form');
    const registerError = document.getElementById('register-error');

    const compteModal = document.getElementById('compte-modal');
    const compteModalCard = document.getElementById('compte-modal-card');
    const compteModalContent = document.getElementById('compte-modal-content');
    const closeCompteModal = document.getElementById('close-compte-modal');
    const compteModalBg = document.getElementById('compte-modal-bg');
    
    // 4. Функция обновления интерфейса и принудительной активации кнопок после входа
    const actualizarInterfaz = (session) => {
      if (session?.user) {
        const user = session.user;
        currentUserName = user.user_metadata?.full_name || user.user_metadata?.nombre || user.email.split('@')[0].toUpperCase();

        if (userWelcome) userWelcome.textContent = `Benvingut, ${currentUserName}`;
        if (userIdEl) userIdEl.textContent = user.id.substring(0, 8).toUpperCase();
        if (userEmailEl) userEmailEl.textContent = user.email;

        authContainer?.classList.add('hidden');
        profileContainer?.classList.remove('hidden');

        // Инициализируем клики документов и связи ТОЛЬКО после того, как контейнер стал видимым
        initCabinetButtons();
      } else {
        profileContainer?.classList.add('hidden');
        authContainer?.classList.remove('hidden');
      }
    };

        // Выносим активацию всех внутренних кнопок кабинета в изолированную функцию
    const initCabinetButtons = () => {
      const btnSocio = document.getElementById('btn-cta-socio');
      const btnCertificat = document.getElementById('btn-cta-colaborar');
      const btnNotificar = document.getElementById('btn-notificar-canvi');

      // Если кнопок на текущей странице нет — мгновенно выходим
      if (!btnSocio || !btnCertificat || !btnNotificar) return;
          
      // Кнопка 1: Sol·licitud de registre d'interès
      btnSocio?.addEventListener('click', () => {
        const currentId = supabase.auth.session ? supabase.auth.session().user.id.substring(0,8).toUpperCase() : 'SO-2026';
        const htmlSocio = `
          <div class="w-full border-4 border-double border-gray-800 p-8 md:p-10 bg-white font-serif text-gray-900 space-y-6 shadow-sm select-text relative text-left max-w-2xl mx-auto leading-relaxed text-xs md:text-sm">
              <div class="absolute right-10 bottom-36 w-36 h-36 border-4 border-dashed border-emerald-700/20 rounded-full flex items-center justify-center text-[11px] font-sans font-black text-emerald-700/20 uppercase tracking-widest rotate-12 pointer-events-none">ADOCAT REGISTRE</div>
              
              <div class="flex justify-between items-start border-b-2 border-gray-800 pb-4 font-sans">
                  <div class="space-y-1">
                      <h2 class="text-sm font-black text-gray-900 uppercase">ASSOCIACIÓ DE DOCENTS OCUPACIONALS DE CATALUNYA</h2>
                      <p class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Registre intern de sol·licituds — Expedient: #SO-${currentId}/26</p>
                  </div>
                  <div class="text-right text-[10px] text-gray-400 shrink-0 font-bold">DATA D'EMISSIÓ:<br>11/09/2026</div>
              </div>

              <div class="text-center py-2">
                  <h3 class="text-xs md:text-sm font-black uppercase tracking-wide underline decoration-1 underline-offset-4 font-sans">Full de sol·licitud d'informació i suma a la comunitat</h3>
              </div>

              <div class="space-y-4 text-gray-800 text-justify font-medium">
                  <p><strong>Detalls del registre:</strong> Es formalitza el registre d'interès de la persona docent <strong>${currentUserName.toUpperCase()}</strong> per rebre informació détaillé sobre els passos i condicions per formar part d'<strong>ADOCAT</strong>, en compliment de l'esperit d'orientació i suport professional de l'associació.</p>
                  
                  <p><strong>Línies d'actuació i suport de referència:</strong></p>
                  
                  <div class="space-y-3 pl-2 border-l-2 border-gray-300">
                      <p><strong>1. Suport entre docents:</strong> Espai de trobada, col·laboració i intercanvi d'experiències professionals per a la millora de les condicions de travail del col·lectiu docent de la Formació Professional Ocupacional (FPE) a Catalunya.</p>
                      <p><strong>2. Orientació i informació:</strong> Accés a actualitzacions informatives sectorials i resolució de dubtes ordinaris relacionats amb el desenvolupament de l'activitat docent.</p>
                      <p><strong>3. Recursos compartits:</strong> Incorporació progressiva a la xarxa col·laborativa per a la consulta de recursos i materials pedagògics aportats de manera voluntària per la mise comunitat de formadors.</p>
                      <p><strong>4. Confidencialitat ordinària:</strong> El tractament de la informació i de les dades recollides es realitza amb total reserva i garanties de privacitat, d'acord amb la normativa vigent de protecció de dades (RGPD).</p>
                  </div>

                  <p class="text-[11px] italic text-gray-500 font-sans">Estem definint un catàleg progressiu de recursos, activitats i suport professional. Cada servei s’anunciarà quan estigui confirmat i amb les seves condicions d’accés.</p>
              </div>

              <div class="pt-8 grid grid-cols-2 gap-6 font-sans text-[10px] font-bold text-center border-t border-gray-100">
                  <div>
                      <p class="uppercase tracking-wider text-gray-400 mb-6">Signatura de l'Interessat/da</p>
                      <p class="border-b border-gray-300 mx-auto w-36 pt-2 font-mono font-normal text-gray-400">[Registrat Electrònicament]</p>
                  </div>
                  <div>
                      <p class="uppercase tracking-wider text-gray-400 mb-6">Equip de Registre ADOCAT</p>
                      <p class="border-b border-gray-300 mx-auto w-36 pt-2 font-mono font-normal text-emerald-700">✓ Rebut Correctament</p>
                  </div>
              </div>
          </div>
        `;
        openLocalModal(htmlSocio);
      });



            // Кнопка 2: Informe d'activitat (Полная оригинальная версия)
      btnCertificat?.addEventListener('click', () => {
        const htmlCertificat = `
          <div class="w-full border-4 border-double border-gray-800 p-8 md:p-10 bg-white font-serif text-gray-900 space-y-6 shadow-sm relative text-left max-w-2xl mx-auto leading-relaxed text-xs md:text-sm">
              <div class="space-y-2 font-sans border-b-2 border-gray-800 pb-4">
                  <p class="text-[10px] font-black tracking-widest text-gray-400 uppercase">ADOCAT — Comunitat Docent de Catalunya</p>
                  <h2 class="text-xl font-black text-gray-900 uppercase tracking-tight">Informe d'activitat i registre col·laboratiu</h2>
                  <p class="text-[9px] font-mono text-gray-400 uppercase">Codi de Verificació Segura (CVS): CVS-ADOCAT-HIST-2026</p>
              </div>

              <div class="py-2 text-justify">
                  <p class="text-xs italic font-medium text-gray-700">L'òrgan de coordinació de l'Associació de Docents Ocupacionals de Catalunya faça constar el registre de participació de la persona docent:</p>
                  <h3 class="text-lg md:text-xl font-black tracking-tight text-brand-dark uppercase my-3 font-sans border-b border-gray-300 pb-1 max-w-md">${currentUserName.toUpperCase()}</h3>
              </div>

              <div class="space-y-3 font-sans">
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-wider">Cronologia d'activitat i estat de les sol·licituds:</p>
                  
                  <div class="border border-gray-200 rounded-xs overflow-hidden">
                      <table class="hidden md:table w-full text-left text-[11px] font-semibold text-gray-600 bg-gray-50/50">
                          <thead class="bg-gray-100 text-gray-800 text-[10px] uppercase font-black border-b border-gray-200">
                              <tr>
                                  <th class="p-2.5 whitespace-nowrap">Període / Data</th>
                                  <th class="p-2.5">Estat de la sol·licitud / Acció</th>
                                  <th class="p-2.5 text-center whitespace-nowrap">Estat de la sol·licitud</th>
                              </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-200 bg-white">
                              <tr>
                                  <td class="p-2.5 font-mono text-gray-400 whitespace-nowrap">12/01/2026</td>
                                  <td class="p-2.5">Accés inicial a la plataforma — Formulari de contacte ordinari</td>
                                  <td class="p-2.5 text-center"><span class="px-1.5 py-0.5 bg-blue-50 text-[#007cc2] border border-blue-100 text-[9px] font-black rounded-xs whitespace-nowrap">Registrat</span></td>
                              </tr>
                              <tr>
                                  <td class="p-2.5 font-mono text-gray-400 whitespace-nowrap">04/05/2026</td>
                                  <td class="p-2.5">Participació voluntària a l'enquesta sectorial de necessitats docents</td>
                                  <td class="p-2.5 text-center"><span class="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-black rounded-xs whitespace-nowrap">Completat</span></td>
                              </tr>
                              <tr>
                                  <td class="p-2.5 font-mono text-gray-400 whitespace-nowrap">11/09/2026</td>
                                  <td class="p-2.5">Registre d'interès per formar part d'ADOCAT — Sol·licitud confirmada</td>
                                  <td class="p-2.5 text-center"><span class="px-1.5 py-0.5 bg-emerald-50 text-brand-green border border-emerald-100 text-[9px] font-black rounded-xs whitespace-nowrap">Rebut</span></td>
                              </tr>
                          </tbody>
                      </table>

                      <div class="block md:hidden bg-white divide-y divide-gray-100 p-1 text-[11px]">
                          <div class="p-3 space-y-2">
                              <div class="flex justify-between items-center">
                                  <span class="font-mono text-gray-400 font-bold">12/01/2026</span>
                                  <span class="px-1.5 py-0.5 bg-blue-50 text-[#007cc2] border border-blue-100 text-[9px] font-black rounded-xs">Registrat</span>
                              </div>
                              <div class="text-gray-700 font-medium">Accés inicial a la plataforma — Formulari de contacte ordinari</div>
                          </div>
                          <div class="p-3 space-y-2">
                              <div class="flex justify-between items-center">
                                  <span class="font-mono text-gray-400 font-bold">04/05/2026</span>
                                  <span class="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 text-[9px] font-black rounded-xs">Completat</span>
                              </div>
                              <div class="text-gray-700 font-medium">Participació voluntària a l'enquesta sectorial de necessitats docents</div>
                          </div>
                          <div class="p-3 space-y-2">
                              <div class="flex justify-between items-center">
                                  <span class="font-mono text-gray-400 font-bold">11/09/2026</span>
                                  <span class="px-1.5 py-0.5 bg-emerald-50 text-brand-green border border-emerald-100 text-[9px] font-black rounded-xs">Rebut</span>
                              </div>
                              <div class="text-gray-700 font-medium">Registre d'interès per formar part d'ADOCAT — Sol·licitud confirmada</div>
                          </div>
                      </div>
                  </div>
              </div>

              <div class="text-xs leading-relaxed text-gray-600 text-justify pt-2">
                  <strong>INDICADORS DE REGISTRE:</strong> Aquest panell mostra l'estat informatiu de les teves interaccions i col·laboracions voluntàries amb l'associació. Cada nova acció o recurs compartit s'actualitzarà de manera progressiva en aquest historial privat d'acord amb els canals disponibles.
              </div>

              <div class="flex justify-between items-center pt-4 font-sans text-[10px] text-gray-400 font-semibold border-t border-gray-100">
                  <p>Registre Central Informatiu: REG-ADOCAT-2026</p>
                  <p class="text-emerald-700 font-bold">✓ Segell de Verificació Històric Actiu</p>
              </div>
          </div>
        `;
        openLocalModal(htmlCertificat);
      });



          // Кнопка 3: Sol·licitud de contacte i propostes a l'equip (С заменой alert на локальную ошибку)
      btnNotificar?.addEventListener('click', (e) => {
        e.preventDefault();
        const htmlSupport = `
          <div class="space-y-4 text-left">
            <div class="border-b border-gray-100 pb-3">
              <span class="text-[10px] font-black uppercase text-brand-green bg-emerald-50 px-2 py-0.5 rounded-full tracking-wider inline-block">Atenció al col·lectiu docent</span>
              <h3 class="text-lg font-black uppercase tracking-tight text-brand-dark mt-1">Enviar una consulta o proposta</h3>
            </div>
            
            <form id="support-secure-form" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-black uppercase tracking-wider text-gray-400 block ml-1">Motiu del contacte</label>
                <select id="support-type" required class="w-full p-3 bg-gray-50 border border-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white transition-all">
                  <option value="consulta" selected>Tinc una consulta</option>
                  <option value="proposta">Vull compartir una necessitat o proposta</option>
                  <option value="irregularitat">Vull comunicar una possible irregularitat</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-black uppercase tracking-wider text-gray-400 block ml-1">Descripció detallada de la teva situació</label>
                <textarea id="support-message" required rows="4" class="w-full p-3 bg-gray-50 border border-gray-200 text-sm font-semibold rounded-xl focus:outline-none focus:border-brand-dark focus:bg-white transition-all" placeholder="Comparteix una consulta, necessitat o incidència relacionada amb la teva activitat docent..."></textarea>
              </div>

              <!-- ЛОКАЛЬНЫЙ ТЕКСТ ОШИБКИ ВНУТРИ МОДАЛКИ (ВМЕСТО ALERT) -->
              <div id="support-error" class="hidden text-xs text-red-600 font-bold bg-red-50 border border-red-200 p-3 rounded-xl text-center my-2 animate-fade-in"></div>

              <button type="submit" id="support-submit-btn" class="w-full bg-brand-dark hover:bg-black text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition-all cursor-pointer shadow-md text-center">
                Enviar formulari de contacte &rarr;
              </button>
            </form>
          </div>
        `;
        openLocalModal(htmlSupport);

        const supportForm = document.getElementById('support-secure-form');
        const supportError = document.getElementById('support-error');

        supportForm?.addEventListener('submit', async (submitEvent) => {
          submitEvent.preventDefault();
          if (supportError) supportError.classList.add('hidden');
          
          const type = document.getElementById('support-type').value;
          const msg = document.getElementById('support-message').value.trim();
          const submitBtn = document.getElementById('support-submit-btn');

          if (submitBtn) {
            submitBtn.setAttribute('disabled', 'true');
            submitBtn.textContent = "S'està enviant...";
          }

          try {
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;

            const { error } = await supabase
              .from('complaints')
              .insert([
                { 
                  centre_name: `CONSULTA DOCENT: ${currentUserName}`, 
                  irregularity_type: type, 
                  description: msg, 
                  contact_info: `ID: ${user?.id?.substring(0,8) || 'AUTH-USER'} | ${user?.email || 'Email verified'}`
                }
              ]);

            if (error) throw error;

            if (compteModalContent) {
              compteModalContent.innerHTML = `
                <div class="text-center py-8 space-y-3">
                  <span class="text-4xl">📩</span>
                  <h4 class="text-base font-black uppercase tracking-tight text-brand-dark">Formulari enviat correctament</h4>
                  <p class="text-xs text-gray-500 font-medium max-w-sm mx-auto text-center leading-relaxed">
                    La teva sol·licitud ha estat registrada de manera segura. L'equip d'ADOCAT valorarà la informació aportada segons els recursos disponibles i es posarà en contacte amb tu molt aviat.
                  </p>
                </div>
              `;
            }
          } catch (err) {
            console.error('Support error:', err.message);
            if (supportError) {
              supportError.textContent = 'Hi va haver un problema en processar la teva sol·licitud. Torna-ho a provar.';
              supportError.classList.remove('hidden');
            }
            if (submitBtn) {
              submitBtn.removeAttribute('disabled');
              submitBtn.textContent = "Enviar formulari de contacte &rarr;";
            }
          }
        });
      });
    }; // КОНЕЦ ИЗОЛИРОВАННОЙ ФУНКЦИИ initCabinetButtons



      // 1. Проверка текущей сессии при загрузке страницы
    supabase.auth.getSession().then(({ data: { session } }) => {
      actualizarInterfaz(session);
    });

    // 2. Отслеживание входа/выхода в реальном времени
    supabase.auth.onAuthStateChange((_event, session) => {
      actualizarInterfaz(session);
    });

    // 3. Выход из аккаунта
    logoutBtn?.addEventListener('click', async () => {
      await supabase.auth.signOut();
    });

    // 4. Логика отправки формы Входа (Accés a l'espai privat)
    if (authForm) {
      authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (authError) authError.classList.add('hidden');

        const emailInput = document.getElementById('auth-email');
        const passwordInput = document.getElementById('auth-password');
        const submitBtn = document.getElementById('auth-submit-btn');

        const email = emailInput ? emailInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';

        console.log('Attempting login for:', email);
        
        if (submitBtn) {
          submitBtn.setAttribute('disabled', 'true');
          submitBtn.textContent = "Processant...";
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
          });

          if (error) throw error;
          console.log('Login successful:', data);

        } catch (err) {
          console.error('Supabase Auth Error:', err.message);
          if (authError) {
            authError.textContent = `Error: ${err.message}`;
            authError.classList.remove('hidden');
          }
        } finally {
          if (submitBtn) {
            submitBtn.removeAttribute('disabled');
            submitBtn.textContent = "Entrar a l'àrea privada →";
          }
        }
      });
    }

    // 5. Управление локальными модальными окнами для документов
    const openLocalModal = (contentHtml) => {
      if (!compteModal || !compteModalCard || !compteModalContent) return;
      compteModalContent.innerHTML = contentHtml;
      compteModal.classList.remove('opacity-0', 'pointer-events-none');
      compteModalCard.classList.remove('scale-95');
    };

    const closeLocalModalFunc = () => {
      compteModal?.classList.add('opacity-0', 'pointer-events-none');
      compteModalCard?.classList.add('scale-95');
    };

    closeCompteModal?.addEventListener('click', closeLocalModalFunc);
    compteModalBg?.addEventListener('click', closeLocalModalFunc);




      // 5.1 Обработчик генерации документа Sol·licitud d'informació
    document.getElementById('btn-cta-socio')?.addEventListener('click', () => {
      const htmlSocio = `
        <div class="w-full border-4 border-double border-gray-800 p-6 md:p-8 bg-white font-serif text-gray-900 space-y-6 shadow-sm select-text relative">
            <div class="absolute right-6 bottom-24 w-32 h-32 border-4 border-dashed border-emerald-700/20 rounded-full flex items-center justify-center text-[10px] font-sans font-black text-emerald-700/20 uppercase tracking-widest rotate-12 pointer-events-none">ADOCAT REGISTRE</div>
            <div class="flex justify-between items-start border-b-2 border-gray-800 pb-4">
                <div class="space-y-1 text-left">
                    <h2 class="text-base md:text-lg font-black tracking-tight text-gray-900 font-sans uppercase">ASSOCIACIÓ DE DOCENTS OCUPACIONALS DE CATALUNYA</h2>
                    <p class="text-[10px] font-sans text-gray-500 font-bold uppercase tracking-wider">Registre intern de sol·licituds — Expedient: #SO-2026/9482</p>
                </div>
            </div>
            <div class="text-center py-1">
                <h3 class="text-sm md:text-base font-black uppercase tracking-wide underline decoration-1 underline-offset-4 font-sans">Full de sol·licitud d'informació i suma a la comunitat</h3>
            </div>
            <div class="text-xs leading-relaxed space-y-3 font-medium text-justify text-gray-800">
                <p>Per la present acta oficial, es formalitza el registre d'interès de la persona docent <strong>${currentUserName.toUpperCase()}</strong> per rebre informació de les condicions d'accés a <strong>ADOCAT</strong>.</p>
            </div>
            <div class="pt-6 grid grid-cols-2 gap-4 font-sans text-[10px] font-bold text-center border-t border-gray-100">
                <div><p class="border-b border-gray-300 mx-auto w-32 pt-2 font-mono font-normal text-gray-400">[Registrat Digitalment]</p></div>
                <div><p class="border-b border-gray-300 mx-auto w-32 pt-2 font-mono font-normal text-emerald-700">✓ Rebut Correctament</p></div>
            </div>
        </div>
      `;
      openLocalModal(htmlSocio);
    });

    // 5.2 Обработчик генерации документа Participació i activitat històrica
    document.getElementById('btn-cta-colaborar')?.addEventListener('click', () => {
      const htmlCertificat = `
        <div class="w-full border-4 border-double border-gray-800 p-6 md:p-8 bg-white font-serif text-gray-900 space-y-6 shadow-sm text-center relative">
            <div class="space-y-1 font-sans">
                <p class="text-[10px] font-black tracking-widest text-gray-400 uppercase">ADOCAT — Comunitat Docent de Catalunya</p>
                <h2 class="text-base font-black text-gray-900 uppercase tracking-tight">Informe d'activitat i registre col·laboratiu</h2>
            </div>
            <div class="py-4">
                <p class="text-xs italic font-medium text-gray-700">L'òrgan de coordinació de l'Associació de Docents Ocupacionals de Catalunya fa constar el registre de la persona docent:</p>
                <h3 class="text-lg md:text-xl font-black tracking-tight text-brand-dark uppercase my-2 font-sans border-b-2 border-gray-800 pb-1 max-w-xs mx-auto">${currentUserName.toUpperCase()}</h3>
                <p class="text-[10px] font-sans font-bold text-brand-green uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-xs inline-block border border-emerald-100">Participació Enregistrada</p>
            </div>
        </div>
      `;
      openLocalModal(htmlCertificat);
    });


        // 6. Логика формы регистрации аккаунта и интереса (БЕЗ ОШИБОК И С АВТОВХОДОМ)
    if (registerFormAdocat) {
      registerFormAdocat.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Скрываем старую ошибку
        if (registerError) registerError.classList.add('hidden');

        // Считываем все поля формы
        const nameVal = document.getElementById('acc-name')?.value.trim() || '';
        const emailVal = document.getElementById('acc-mail')?.value.trim() || '';
        const phoneVal = document.getElementById('acc-phone')?.value.replace(/\D/g, '') || '';
        const roleVal = document.getElementById('acc-implicacion')?.value || 'socio';
        const passwordVal = document.getElementById('acc-password')?.value || '';
        const confirmVal = document.getElementById('acc-password-confirm')?.value || '';

        const submitBtnReg = document.getElementById('acc-submit-btn');

        // Валидация 1: совпадение паролей
        if (passwordVal !== confirmVal) {
          if (registerError) {
            registerError.textContent = "Les contrasenyes no coincideixen. Torna-ho a provar.";
            registerError.classList.remove('hidden');
          }
          return;
        }

        // Валидация 2: сложность пароля (ИСПРАВЛЕНО: убран ломающий символ \)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@\(!\%*?&._-]).{8,}\$/;
        if (!passwordRegex.test(passwordVal)) {
          if (registerError) {
            registerError.textContent = "La contrasenya no compleix els requisits de seguretat mencionats.";
            registerError.classList.remove('hidden');
          }
          return;
        }

        if (submitBtnReg) {
          submitBtnReg.disabled = true;
          submitBtnReg.textContent = "S'està creant el compte...";
        }

        try {
          // А. Регистрация в Supabase
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: emailVal,
            password: passwordVal,
            options: {
              data: {
                full_name: nameVal,
                phone: phoneVal,
                role_interest: roleVal
              }
            }
          });

          if (authError) throw authError;

          // Б. Запись в таблицу leads
          const { error: dbError } = await supabase.from('leads').insert([
            {
              nombre: nameVal,
              email: emailVal,
              telefono: phoneVal,
              modalidad_implicacion: roleVal,
              created_at: new Date().toISOString()
            }
          ]);
          if (dbError) throw dbError;

          // В. Передаем лид в Brevo
          await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailVal, nombre: nameVal, telefono: phoneVal, role: roleVal })
          });

          console.log('Account created successfully. Forcing login...');

          // Г. Автоматический бесшовный вход
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: emailVal,
            password: passwordVal
          });

          if (loginError) throw loginError;
          console.log('Auto-login successful:', loginData);

        } catch (err) {
          console.error('Registration processing error:', err.message);
          if (registerError) {
            registerError.textContent = `Hi va haver un problema en processar el registre: ${err.message}`;
            registerError.classList.remove('hidden');
          }
        } finally {
          // ИСПРАВЛЕНО: убрана ломающая проверка лишней кнопки
          if (submitBtnReg) {
            submitBtnReg.disabled = false;
            submitBtnReg.textContent = "Enviar sol·licitud ➔";
          }
        }
      });
    }

    // 7. ИНИЦИАЛИЗАЦИЯ ИНТЕРАКТИВНЫХ ГЛАЗИКОВ (БЕЗОПАСНАЯ ВЕРСИЯ)
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault(); 
        e.stopPropagation();

        const input = button.parentElement?.querySelector('input');
        if (!input) return;

        if (input.type === 'password') {
          input.type = 'text';
          button.textContent = '🙈';
        } else {
          input.type = 'password';
          button.textContent = '👁️';
        }
      });
    });

  }); // КОНЕЦ DOMContentLoaded
} // КОНЕЦ проверки window
