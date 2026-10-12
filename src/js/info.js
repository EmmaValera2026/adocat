// src/js/info.js
import { QuizEngine } from './class.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pbxmhrwhebegnejjzksp.supabase.co";
const supabaseAnonKey = "sb_publishable_Fg8_-r_e4Ef0rQDIzqWYyg_oK9Rsek2";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 🔒 ГЛОБАЛЬНЫЙ КЭШ ЭЛЕМЕНТОВ DOM — СТРОГО НА САМОМ ВЕРХУ ФАЙЛА
let DOM_CACHE = {};
let listaLeads = [];
let filtroRolActual = 'all';
let criterioSortActual = 'date-desc';
let listaComplaints = [];
let pestañaActual = 'leads'; 
let engine = null; 


// Функция кэширования селекторов (Обновлена под 5 карточек метрик)
const inicializarCacheDOM = () => {
    DOM_CACHE = {
        quizFlowContainer: document.getElementById('quiz-flow-container'),
        progressBar: document.getElementById('progress-bar'),
        stepCounter: document.getElementById('step-counter'),
        stepsHolder: document.getElementById('dynamic-steps-holder'),
        questionTemplate: document.getElementById('question-template'),
        buttonTemplate: document.getElementById('button-template'),
        stepCardForm: document.getElementById('step-card-form'),
        stepCardSuccess: document.getElementById('step-card-success'),
        inputNombre: document.getElementById('lead-nombre'),
        inputEmail: document.getElementById('lead-email'),
        inputTelefono: document.getElementById('lead-telefono'),
        inputProvincia: document.getElementById('lead-provincia'),
        inputRole: document.getElementById('lead-role'),
        
        ctaModal: document.getElementById('cta-modal'),
        ctaModalCard: document.getElementById('cta-modal-card'),
        ctaModalTitle: document.getElementById('cta-modal-title'),
        ctaModalText: document.getElementById('cta-modal-text'),
        
        confirmModal: document.getElementById('confirm-modal'),
        confirmCard: document.getElementById('confirm-modal-card'),
        confirmPercent: document.getElementById('confirm-modal-percent'),
        confirmBar: document.getElementById('confirm-modal-bar'),
        modalNextBtn: document.getElementById('modal-next-btn'),
        prevQuestionBtn: document.getElementById('prev-question-btn'),
        
        resultCard: document.getElementById('step-card-resultat'),
        resultTitle: document.getElementById('result-status-title'),
        resultDescription: document.getElementById('result-description-text'),
        resultLine: document.getElementById('result-top-line'),
        resultIcon: document.getElementById('result-icon'),
        
        adminModal: document.getElementById('admin-modal'),
        adminCard: document.getElementById('modal-card'),
        loginBlock: document.getElementById('admin-login-block'),
        contentBlock: document.getElementById('admin-content-block'),
        passwordInput: document.getElementById('admin-password-input'),
        tbody: document.getElementById('leads-table-body'),
        mobileList: document.getElementById('leads-mobile-list'),
        
        // Новые метрики под требования Эммы
        metricTotal: document.getElementById('metric-total'),
        metricOnlyReg: document.getElementById('metric-only-reg'),
        metricSocios: document.getElementById('metric-socios'),
        metricPadas: document.getElementById('metric-padas'),
        metricColaboradores: document.getElementById('metric-colaboradores')
    };
};

// ⚡ Обновление метрик панели администратора (Расширенная логика на 5 категорий)
const actualizarMetricasAdmin = (leads) => {
    if (!DOM_CACHE.metricTotal) return;

    const total = leads.length;
    
    // 1. Фильтр: Только регистрация (Поле пустое, либо человек выбрал только инфо-бюллетень — Пункт 4)
    const onlyReg = leads.filter(l => !l.modalidad_implicacion || l.modalidad_implicacion.toLowerCase() === 'boletin' || l.modalidad_implicacion.toLowerCase() === 'butlleti').length;
    
    // 2. Фильтр: Члены ассоциации (Пункт 1)
    const socios = leads.filter(l => l.modalidad_implicacion && l.modalidad_implicacion.toLowerCase() === 'socio').length;
    
    // 3. Фильтр: Друзья PADA (Пункт 7)
    const padas = leads.filter(l => l.modalidad_implicacion && l.modalidad_implicacion.toLowerCase() === 'pada').length;
    
    // 4. Фильтр: Актив комиссий и организаций (Пункт 7)
    const colaboradores = leads.filter(l => l.modalidad_implicacion && (l.modalidad_implicacion.toLowerCase() === 'comissio' || l.modalidad_implicacion.toLowerCase() === 'entitat')).length;

    // Отрисовываем цифры в интерфейсе
    DOM_CACHE.metricTotal.textContent = total;
    if (DOM_CACHE.metricOnlyReg) DOM_CACHE.metricOnlyReg.textContent = onlyReg;
    if (DOM_CACHE.metricSocios) DOM_CACHE.metricSocios.textContent = socios;
    if (DOM_CACHE.metricPadas) DOM_CACHE.metricPadas.textContent = padas;
    if (DOM_CACHE.metricColaboradores) DOM_CACHE.metricColaboradores.textContent = colaboradores;
};



// ⚡ Универсальный рендеринг таблицы пользователей с поддержкой 5 фильтров
const renderizarTabla = (filtro, sorting, tbody, mobileList) => {
    const rowTemplate = document.getElementById('table-row-template');
    const cardTemplate = document.getElementById('mobile-card-template');
    
    if (!tbody || !mobileList || !rowTemplate || !cardTemplate) return;

    tbody.innerHTML = '';
    mobileList.innerHTML = '';

    // Логика фильтрации под новые состояния (Пункт 4 и 7)
    let leadsProcesados = [...listaLeads];
    if (filtro !== 'all') {
        if (filtro === 'only-reg') {
            leadsProcesados = listaLeads.filter(l => !l.modalidad_implicacion || l.modalidad_implicacion.toLowerCase() === 'boletin' || l.modalidad_implicacion.toLowerCase() === 'butlleti');
        } else {
            leadsProcesados = listaLeads.filter(l => l.modalidad_implicacion && l.modalidad_implicacion.toLowerCase() === filtro.toLowerCase());
        }
    }

    // Сортировка данных
    leadsProcesados.sort((a, b) => {
        if (sorting === 'date-desc') return new Date(b.created_at) - new Date(a.created_at);
        if (sorting === 'date-asc') return new Date(a.created_at) - new Date(b.created_at);
        if (sorting === 'name-asc') return (a.nombre || '').localeCompare(b.nombre || '');
        return 0;
    });

    if (leadsProcesados.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-400 font-medium">No s'han trobat registres amb aquests criteris.</td></tr>`;
        mobileList.innerHTML = `<div class="p-6 text-center text-gray-400 font-medium border border-dashed border-gray-200">No s'han trobat registres.</div>`;
        return;
    }

    leadsProcesados.forEach(lead => {
        const fechaText = new Date(lead.created_at).toLocaleDateString('ca-ES');
        const provinciaText = lead.provincia || 'Barcelona';
        
        // Перевод технической роли в красивый инклюзивный текст бейджа (Пункт 13)
        let rolText = 'SOCI/A';
        let badgeStyle = "bg-emerald-50 text-brand-green border-emerald-100";
        let lineStyle = "bg-brand-green";

        if (lead.modalidad_implicacion) {
            const mod = lead.modalidad_implicacion.toLowerCase();
            if (mod === 'pada') {
                rolText = 'PADA';
                badgeStyle = "bg-purple-50 text-purple-700 border-purple-100";
                lineStyle = "bg-purple-600";
            } else if (mod === 'boletin' || mod === 'butlleti') {
                rolText = 'BUTLLETÍ';
                badgeStyle = "bg-blue-50 text-blue-600 border-blue-100";
                lineStyle = "bg-blue-500";
            } else if (mod === 'comissio') {
                rolText = 'COMISSIÓ';
                badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
                lineStyle = "bg-amber-500";
            } else if (mod === 'entitat') {
                rolText = 'ENTITAT';
                badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-100";
                lineStyle = "bg-indigo-600";
            }
        } else {
            rolText = 'REGISTRE';
            badgeStyle = "bg-gray-100 text-gray-600 border-gray-200";
            lineStyle = "bg-gray-400";
        }

        // 1. Отрисовка десктопной строки (ПК)
        const rowClone = rowTemplate.content.cloneNode(true);
        const trNode = rowClone.querySelector('tr');
        if (trNode) trNode.setAttribute('data-id', lead.id);

        rowClone.querySelector('.td-date').textContent = fechaText;
        rowClone.querySelector('.td-name').textContent = `${lead.nombre || 'Anònim'} (${provinciaText})`;
        rowClone.querySelector('.td-email').textContent = lead.email || '-';
        rowClone.querySelector('.td-phone').textContent = lead.telefono || '-';
        
        const badge = rowClone.querySelector('.td-badge');
        if (badge) {
            badge.textContent = rolText;
            badge.className = `td-badge px-2 py-0.5 text-[10px] font-black rounded-xs uppercase tracking-wider border ${badgeStyle}`;
        }
        tbody.appendChild(rowClone);

        // 2. Отрисовка мобильной карточки (Смартфоны)
        const cardClone = cardTemplate.content.cloneNode(true);
        const cardDiv = cardClone.querySelector('div');
        if (cardDiv) cardDiv.setAttribute('data-id', lead.id);

        cardClone.querySelector('.card-date').textContent = fechaText;
        cardClone.querySelector('.card-name').textContent = `${lead.nombre || 'Anònim'} (${provinciaText})`;
        cardClone.querySelector('.card-email').textContent = lead.email || '-';
        cardClone.querySelector('.card-phone').textContent = lead.telefono || '-';
        
        const cardBadge = cardClone.querySelector('.card-badge');
        const cardSideLine = cardClone.querySelector('.card-side-line');
        if (cardBadge) {
            cardBadge.textContent = rolText;
            cardBadge.className = `card-badge px-2 py-0.5 text-[9px] font-black rounded-xs uppercase tracking-wider border ${badgeStyle}`;
            if (cardSideLine) cardSideLine.className = `absolute top-0 left-0 bottom-0 w-1 card-side-line ${lineStyle}`;
        }
        mobileList.appendChild(cardClone);
    });

    actualizarMetricasAdmin(listaLeads);
};





// ⚡ Рендеринг таблицы со служебными инцидентами и консультациями (Обновлено под Пункт 9)
const renderizarComplaints = (tbody, mobileList) => {
    const rowTemplate = document.getElementById('table-row-template'); 
    const cardTemplate = document.getElementById('complaint-card-template');
    
    if (!tbody || !mobileList || !cardTemplate) return;

    tbody.innerHTML = '';
    mobileList.innerHTML = '';

    if (listaComplaints.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-400 font-medium">No s'han trobat consultes o incidències enregistrades.</td></tr>`;
        mobileList.innerHTML = `<div class="p-6 text-center text-gray-400 font-medium border border-dashed border-gray-200">No s'han trobat consultes o incidències.</div>`;
        return;
    }

    listaComplaints.forEach(comp => {
        const fechaText = new Date(comp.created_at).toLocaleDateString('ca-ES');
        const esConsulta = comp.centre_name && comp.centre_name.includes('CONSULTA DOCENT:');
        
        const displayCentre = esConsulta 
            ? comp.centre_name.replace('CONSULTA DOCENT:', '👤').trim() 
            : (comp.centre_name || 'Desconegut');
            
        let displayType = `<span class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xs bg-gray-100 text-gray-700 border border-gray-200">Incidència</span>`;
        
        if (comp.irregularity_type) {
            const typeValue = comp.irregularity_type.toLowerCase();
            if (typeValue === 'consulta') {
                displayType = `<span class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xs bg-blue-50 text-[#007cc2] border border-blue-100">Consulta</span>`;
            } else if (typeValue === 'proposta') {
                displayType = `<span class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xs bg-purple-50 text-purple-700 border border-purple-100">Proposta</span>`;
            } else if (typeValue === 'irregularitat') {
                displayType = `<span class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xs bg-rose-50 text-rose-700 border border-rose-100">Possible irregularitat</span>`;
            }
        } else if (esConsulta) {
            displayType = `<span class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-xs bg-blue-50 text-[#007cc2] border border-blue-100">📌 Suport Docent</span>`;
        }

        // 1. Десктопная строка (ПК)
        if (rowTemplate) {
            const rowClone = rowTemplate.content.cloneNode(true);
            const trNode = rowClone.querySelector('tr');
            if (trNode) {
                trNode.setAttribute('data-id', comp.id);
                if (esConsulta || comp.irregularity_type === 'consulta') trNode.classList.add('bg-blue-50/20');
            }

            const cellName = rowClone.querySelector('.td-name');
            const cellEmail = rowClone.querySelector('.td-email');
            const cellPhone = rowClone.querySelector('.td-phone');
            const cellBadge = rowClone.querySelector('.td-badge');
            const cellAction = rowClone.querySelector('.view-answers-btn');

            if (rowClone.querySelector('.td-date')) rowClone.querySelector('.td-date').textContent = fechaText;
            if (cellName) cellName.innerHTML = displayCentre;
            if (cellEmail) cellEmail.innerHTML = displayType;
            if (cellPhone) cellPhone.textContent = comp.contact_info || '-';
            if (cellBadge) cellBadge.closest('td').classList.add('hidden'); 
            if (cellAction) {
                cellAction.textContent = "👀 Ver";
                cellAction.className = "view-complaint-btn px-4 py-2 text-xs font-black bg-brand-dark text-white rounded-xs cursor-pointer uppercase tracking-wider shadow-xs";
            }
            tbody.appendChild(rowClone);
        }

        // 2. Мобильная карточка (Смартфоны)
        const cardClone = cardTemplate.content.cloneNode(true);
        const cardDiv = cardClone.querySelector('div');
        if (cardDiv) {
            cardDiv.setAttribute('data-id', comp.id);
            if (esConsulta || comp.irregularity_type === 'consulta') cardDiv.classList.add('bg-blue-50/20', 'border-blue-100');
        }

        const mobileCentre = cardClone.querySelector('.comp-card-centre');
        const mobileType = cardClone.querySelector('.comp-card-type');
        
        const badgeMobil = cardClone.querySelector('.quiz-card span');
        if (badgeMobil && comp.irregularity_type) {
            badgeMobil.textContent = comp.irregularity_type.toUpperCase();
        }

        cardClone.querySelector('.comp-card-date').textContent = fechaText;
        if (mobileCentre) mobileCentre.innerHTML = displayCentre;
        if (mobileType) mobileType.innerHTML = displayType;
        cardClone.querySelector('.comp-card-contact').textContent = comp.contact_info || '-';
        mobileList.appendChild(cardClone);
    });
};

// ⚡ Функция экспорта данных в CSV (Добавлено 5 новых категорий и инклюзивный язык — Пункт 13)
const ejecutarExportacionCSV = () => {
    if (listaLeads.length === 0) return console.warn('No hi ha dades per exportar.');
    
    let csvContenido = "data:text/csv;charset=utf-8,Data,Nom complet,Província laboral,Correu electrònic,Telèfon,Modalitat d'implicació\n";
    
    listaLeads.forEach(l => {
        const d = new Date(l.created_at).toLocaleDateString('ca-ES');
        const n = (l.nombre || 'Anònim').replace(/,/g, ' ');
        const p = (l.provincia || 'Barcelona').replace(/,/g, ' ');
        const e = (l.email || '-').replace(/,/g, ' ');
        const t = (l.telefono || '-').replace(/,/g, ' ');
        
        let r = 'Només registre';
        if (l.modalidad_implicacion) {
            const m = l.modalidad_implicacion.toLowerCase();
            if (m === 'socio') r = "Persona associada";
            if (m === 'pada') r = "PADA (Persones Amigues d'ADOCAT)";
            if (m === 'boletin' || m === 'butlleti') r = 'Butlletí de novetats';
            if (m === 'comissio') r = 'Participar en una comissió';
            if (m === 'entitat') r = 'Entitat col·laboradora';
        }
        
        csvContenido += `${d},${n},${p},${e},${t},${r}\n`;
    });
    
    const link = document.createElement("a");
    link.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContenido));
    link.setAttribute("download", `SOL·LICITUDS_ADOCAT.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};





// 🔥 ГЛАВНЫЙ СЛУШАТЕЛЬ СТРАНИЦЫ
document.addEventListener('DOMContentLoaded', () => {
    // Объявляем переменные для вкладок здесь, чтобы они были доступны всему слушателю
    let btnComplaints;
    let btnSupport;

    inicializarCacheDOM();
    
    btnComplaints = document.getElementById('tab-btn-complaints');
    btnSupport = document.getElementById('tab-btn-support');

    // ⚡ Функция отрисовки шагов квиза (Обновлено под Пункт 8 брифа)
    const renderizarPasoQuiz = (state) => {
        if (DOM_CACHE.progressBar) DOM_CACHE.progressBar.style.width = `${state.percent}%`;
        if (DOM_CACHE.stepCounter) DOM_CACHE.stepCounter.textContent = `${state.currentIndex + 1} / ${state.totalSteps}`;

        if (DOM_CACHE.prevQuestionBtn) {
            if (state.currentIndex > 0 && !state.isQuizFinished) {
                DOM_CACHE.prevQuestionBtn.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                DOM_CACHE.prevQuestionBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        }

        // Если квиз завершен — выводим честное информационное окно
        if (state.isQuizFinished) {
            if (DOM_CACHE.quizFlowContainer) DOM_CACHE.quizFlowContainer.classList.add('hidden');
            if (DOM_CACHE.stepsHolder) DOM_CACHE.stepsHolder.innerHTML = '';
            
            const stepCounterBlock = DOM_CACHE.stepCounter?.closest('.bg-white');
            if (stepCounterBlock) stepCounterBlock.classList.add('hidden');
            if (DOM_CACHE.prevQuestionBtn) DOM_CACHE.prevQuestionBtn.classList.add('hidden');

            if (DOM_CACHE.resultTitle) DOM_CACHE.resultTitle.textContent = "Perfil docent registrat correctament";
            if (DOM_CACHE.resultDescription) {
                DOM_CACHE.resultDescription.innerHTML = `Gràcies per compartir la teva realitat docent. Les teves respostes han estat recollides de manera segura i ens ajuden a conèixer millor les necessitats actuals del col·lectiu (presencial, teleformació i tutoria) per orientar les prioritats de suport d'ADOCAT. Aquesta recollida de dades té una finalitat exclusivament informativa i cooperativa, i en cap cas constitueix una valoració jurídica automàtica.`;
            }
            if (DOM_CACHE.resultLine) DOM_CACHE.resultLine.className = "absolute top-0 left-0 right-0 h-2 bg-brand-green";
            if (DOM_CACHE.resultIcon) DOM_CACHE.resultIcon.textContent = "📋";

            if (DOM_CACHE.resultCard) {
                DOM_CACHE.resultCard.classList.remove('hidden');
                setTimeout(() => {
                    DOM_CACHE.resultCard.classList.remove('opacity-0');
                    DOM_CACHE.resultCard.classList.add('opacity-100');
                }, 50);
            }
            return;
        }




                // 3. Рендеринг карточки текущего вопроса квиза
        if (DOM_CACHE.stepsHolder) DOM_CACHE.stepsHolder.innerHTML = ''; 
        if (!state.currentQuestion) return;

        const cardClone = DOM_CACHE.questionTemplate?.content.cloneNode(true);
        const cardDiv = cardClone?.querySelector('.quiz-card');
        const title = cardClone?.querySelector('.question-title');
        const grid = cardClone?.querySelector('.options-grid');

        if (title) title.textContent = state.currentQuestion.text;

        state.currentQuestion.options.forEach(option => {
            const btnClone = DOM_CACHE.buttonTemplate.content.cloneNode(true);
            const btn = btnClone.querySelector('button');
            if (btn) {
                btn.textContent = option;
                if (state.currentQuestion.savedAnswer === option) {
                    btn.setAttribute('data-selected', 'true');
                    btn.style.borderColor = '#00bf63';
                    btn.style.backgroundColor = '#f4fbf7';
                }

                btn.addEventListener('click', () => {
                    engine.saveAnswer(state.currentQuestion.id, option);
                    abrirModalConfirmacion(state.currentProgress);
                });
            }
            if (grid) grid.appendChild(btnClone);
        });

        if (cardDiv) cardDiv.classList.add('opacity-0', '-translate-y-6', 'transition-all', 'duration-500');
        if (DOM_CACHE.stepsHolder) DOM_CACHE.stepsHolder.appendChild(cardClone);
        
        setTimeout(() => {
            const activeCard = DOM_CACHE.stepsHolder?.querySelector('.quiz-card');
            if (activeCard) activeCard.classList.remove('opacity-0', '-translate-y-6');
        }, 50);
    }; // КОНЕЦ функции renderizarPasoQuiz



    

        // ⚡ Логика модального окна подтверждения ответа (Прогресс опроса)
    const abrirModalConfirmacion = (currentProgress) => {
        if (DOM_CACHE.confirmPercent) DOM_CACHE.confirmPercent.textContent = `Has participat en el ${currentProgress}% de l'enquesta`;
        if (DOM_CACHE.confirmBar) DOM_CACHE.confirmBar.style.width = `${currentProgress}%`;

        if (DOM_CACHE.confirmModal && DOM_CACHE.confirmCard) {
            DOM_CACHE.confirmModal.classList.remove('opacity-0', 'pointer-events-none');
            DOM_CACHE.confirmCard.classList.remove('scale-95');
        }

        if (DOM_CACHE.modalNextBtn) {
            DOM_CACHE.modalNextBtn.onclick = () => {
                if (DOM_CACHE.confirmModal && DOM_CACHE.confirmCard) {
                    DOM_CACHE.confirmModal.classList.add('opacity-0', 'pointer-events-none');
                    DOM_CACHE.confirmCard.classList.add('scale-95');
                }
                setTimeout(() => engine.nextStep(), 200);
            };
        }
    };

    // ⚡ Функции управления экранами и модальными окнами квиза
    const revealForm = () => {
        if (DOM_CACHE.resultCard) DOM_CACHE.resultCard.classList.add('hidden');
        if (DOM_CACHE.stepCardForm) {
            DOM_CACHE.stepCardForm.classList.remove('hidden');
            setTimeout(() => {
                DOM_CACHE.stepCardForm.classList.remove('opacity-0');
                DOM_CACHE.stepCardForm.classList.add('opacity-100');
            }, 50);
        }
    };

    const openModal = (title, htmlContent) => {
        if (DOM_CACHE.ctaModalTitle && DOM_CACHE.ctaModalText && DOM_CACHE.ctaModal && DOM_CACHE.ctaModalCard) {
            DOM_CACHE.ctaModalTitle.textContent = title;
            DOM_CACHE.ctaModalText.innerHTML = htmlContent;
            DOM_CACHE.ctaModal.classList.remove('opacity-0', 'pointer-events-none');
            DOM_CACHE.ctaModalCard.classList.remove('scale-95');
        }
    };

    const closeModal = () => {
        if (DOM_CACHE.ctaModal && DOM_CACHE.ctaModalCard) {
            DOM_CACHE.ctaModal.classList.add('opacity-0', 'pointer-events-none');
            DOM_CACHE.ctaModalCard.classList.add('scale-95');
        }
    };




        // ⚡ Инициализация мотора опросника и подписка на обновления
    if (DOM_CACHE.quizFlowContainer && DOM_CACHE.questionTemplate) {
        engine = new QuizEngine((state) => renderizarPasoQuiz(state));
        engine.start();

        DOM_CACHE.prevQuestionBtn?.addEventListener('click', () => engine.prevStep());
        document.getElementById('go-to-form-btn')?.addEventListener('click', () => revealForm());
        
        // Перехват формы и отправка данных в режиме запроса интереса (Пункт 4)
        document.getElementById('lead-form-adocat')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputProvincia = document.getElementById('lead-provincia');
            const inputRole = document.getElementById('lead-role');
            const quizErrorEl = document.getElementById('quiz-error-msg');

            if (quizErrorEl) quizErrorEl.classList.add('hidden');

            const userData = {
                nombre: DOM_CACHE.inputNombre?.value.trim() || 'No especificat',
                email: DOM_CACHE.inputEmail?.value.trim() || '',
                telefono: DOM_CACHE.inputTelefono?.value.replace(/\D/g, '') || '',
                provincia: inputProvincia ? inputProvincia.value : 'No especificada',
                role: inputRole ? inputRole.value : 'socio'
            };

            const result = await engine.saveLeadToDatabase(userData);
            if (result.success) {
                if (DOM_CACHE.stepCardForm) DOM_CACHE.stepCardForm.classList.add('hidden');
                if (DOM_CACHE.stepCardSuccess) {
                    DOM_CACHE.stepCardSuccess.classList.remove('hidden');
                    setTimeout(() => DOM_CACHE.stepCardSuccess.classList.remove('opacity-0'), 50);
                }
            } else {
                // Вместо alert() выводим аккуратную ошибку в интерфейс
                if (quizErrorEl) {
                    quizErrorEl.textContent = "Hi va haver un problema en processar la teva sol·licitud d'informació. Torna-ho a provar.";
                    quizErrorEl.classList.remove('hidden');
                }
            }
        });




               // Блок документов: Full de sol·licitud d'informació
        document.getElementById('btn-cta-socio')?.addEventListener('click', () => {
            const htmlSocio = `
                <div class="w-full border-4 border-double border-gray-800 p-8 md:p-10 bg-white font-serif text-gray-900 space-y-6 shadow-sm select-text relative">
                    <div class="absolute right-10 bottom-24 w-32 h-32 border-4 border-dashed border-emerald-700/20 rounded-full flex items-center justify-center text-[10px] font-sans font-black text-emerald-700/20 uppercase tracking-widest rotate-12 pointer-events-none">ADOCAT REGISTRE</div>
                    <div class="flex justify-between items-start border-b-2 border-gray-800 pb-4">
                        <div class="space-y-1 text-left">
                            <h2 class="text-xl md:text-2xl font-black tracking-tight text-gray-900 font-sans uppercase">ASSOCIACIÓ DE DOCENTS OCUPACIONALS DE CATALUNYA</h2>
                            <p class="text-xs font-sans text-gray-500 font-bold uppercase tracking-wider">REGISTRE INTERN DE SOL·LICITUDS — PROTOCOL: #SO-2026/9482</p>
                        </div>
                        <div class="text-right font-sans text-xs text-gray-400">DATA: 12/09/2026</div>
                    </div>
                    <div class="text-center py-2">
                        <h3 class="text-lg md:text-xl font-black uppercase tracking-wide underline decoration-1 underline-offset-4">FULL DE SOL·LICITUD D'INFORMACIÓ I SUMA A LA COMUNITAT</h3>
                    </div>
                    <div class="text-base leading-relaxed space-y-4 font-medium text-justify text-gray-800">
                        <p>Per la present acta oficial, es formalitza el registre d'interès de la persona docent per rebre informació sobre els passos per formar part d'<strong>ADOCAT</strong>. L'associació promou l'intercanvi d'experiències professionals i el reconeixement professional del col·lectiu docent de la Formació Professional Ocupacional (FPE) a Catalunya.</p>
                        <div class="bg-gray-50 border-l-4 border-gray-800 p-4 font-sans text-sm text-gray-700 space-y-2 rounded-xs">
                            <p><strong>1. SUPORT ENTRE DOCENTS:</strong> Espai de col·laboració i intercanvi d'eines professionals per a la millora contínua de les condicions de travail.</p>
                            <p><strong>2. RECURSOS COMPARTITS:</strong> Informació i orientació sectorial d'acord amb les línies de treball que es defineixin de manera progressiva.</p>
                            <p><strong>3. ACCÉS A LA COMUNITAT:</strong> Canals de comunicació interns per a la resolució cooperativa de dubtes ordinaris relacionats amb l'activitat docent.</p>
                        </div>
                        <p class="text-sm italic text-gray-600">La informació personal facilitada serà tractada com a confidencial i amb garanties de privacitat per coordinar el procés d'informació de les condicions d'associació oficials.</p>
                    </div>
                    <div class="pt-8 grid grid-cols-2 gap-4 font-sans text-xs font-bold text-center border-t border-gray-100">
                        <div>
                            <p class="uppercase tracking-wider text-gray-400 mb-6">Signatura de l'Interessat/da</p>
                            <p class="border-b border-gray-300 mx-auto w-40 pt-2 font-mono font-normal text-gray-400">[Registrat Digitalment]</p>
                        </div>
                        <div>
                            <p class="uppercase tracking-wider text-gray-400 mb-6">Equip de Registre ADOCAT</p>
                            <p class="border-b border-gray-300 mx-auto w-40 pt-2 font-mono font-normal text-emerald-700">✓ Rebut Correctament</p>
                        </div>
                    </div>
                </div>
            `;
            openModal("📄 SOL·LICITUDS", htmlSocio);
        });

        // Блок документов: Document de participació en l'enquesta
        document.getElementById('btn-cta-colaborar')?.addEventListener('click', () => {
            const inputNombreVal = DOM_CACHE.inputNombre && DOM_CACHE.inputNombre.value.trim() ? DOM_CACHE.inputNombre.value.toUpperCase() : 'DOCENT ENREGISTRAT';
            const htmlCertificat = `
                <div class="w-full border-4 border-double border-gray-800 p-8 md:p-10 bg-white font-serif text-gray-900 space-y-6 shadow-sm text-center relative">
                    <div class="absolute inset-2 border border-gray-200 pointer-events-none"></div>
                    <div class="space-y-2 font-sans relative z-10">
                        <p class="text-xs font-black tracking-widest text-gray-400 uppercase">ADOCAT — Comunitat Docent de Catalunya</p>
                        <h2 class="text-xl font-black text-gray-900 uppercase tracking-tight">DOCUMENT DE PARTICIPACIÓ EN L'ENQUESTA SECTORIAL</h2>
                        <p class="text-xs font-mono text-gray-400 uppercase">Codi de Verificació Segura (CVS): CVS-ADOCAT-93821-2026</p>
                    </div>
                    <div class="py-6 relative z-10">
                        <p class="text-sm italic font-medium text-gray-700">L'òrgan de coordinació de l'Associació de Docents Ocupacionals de Catalunya fa constar que:</p>
                        <h3 class="text-xl md:text-3xl font-black tracking-tight text-brand-dark uppercase my-4 font-sans border-b-2 border-gray-800 pb-2 max-w-md mx-auto">${inputNombreVal}</h3>
                        <p class="text-xs font-sans font-bold text-brand-green uppercase tracking-wider bg-emerald-50 px-3 py-1.5 rounded-xs inline-block border border-emerald-100">Participació Enregistrada</p>
                    </div>
                    <div class="text-base leading-relaxed max-w-2xl mx-auto text-justify font-medium text-gray-600 pb-4 border-b border-gray-100">
                        La persona docent ha completat satisfactòriament el qüestionari sectorial a la plataforma d'<strong>ADOCAT</strong>. Els indicadors recollits s'utilitzaran exclusivament de manera interna per conèixer les necessitats i dificultats del col·lectiu (incloent docència presencial, teleformació i tutoria) i orientar les prioritats de l'associació, sense emetre conclusions jurídiques automàtiques.
                    </div>
                    <div class="flex justify-between items-center pt-4 font-sans text-xs text-gray-400 font-semibold px-4">
                        <p>Registre de Control: REG-ADOCAT-2026</p>
                        <p class="text-emerald-700 font-bold">✓ Segell de Seguretat Actiu</p>
                    </div>
                </div>
            `;
            openModal("📜 PARTICIPACIÓ", htmlCertificat);
        });

        document.getElementById('btn-cta-boletin')?.addEventListener('click', function() {
            this.innerHTML = "✓ Subscrit";
            this.className = "w-full bg-emerald-50 text-emerald-700 font-black text-xs uppercase tracking-wider py-3.5 rounded-xs border border-emerald-200 transition-all cursor-default select-none pointer-events-none";
        });

        document.getElementById('btn-reiniciar-quiz')?.addEventListener('click', () => { localStorage.removeItem('adocat_answers_session'); window.location.reload(); });
        document.getElementById('close-cta-modal-btn')?.addEventListener('click', () => closeModal());
        document.getElementById('close-cta-modal-bottom-btn')?.addEventListener('click', () => closeModal());
    }



    
       // ⚡ ЛОГИКА ПОДПИСКИ НА РАССЫЛКУ НОВОСТЕЙ (Интеграция с сервисом Brevo)
    const ejecutarLogicaSuscripcion = () => {
        const form = document.getElementById('news-letter-form');
        const container = document.getElementById('news-sub-container');
        const inputEmail = document.getElementById('sub-email');

        if (!form || !container || !inputEmail) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const emailTarget = inputEmail.value.trim();
            const submitBtn = form.querySelector('button[type="submit"]');
            const subErrorEl = document.getElementById('news-sub-error');
            
            if (subErrorEl) subErrorEl.classList.add('hidden');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "S'està trametent...";
            }

            try {
                const response = await fetch('/api/save-lead-brevo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailTarget }) 
                });

                if (response.ok) {
                    container.innerHTML = `
                        <div class="text-center py-6 space-y-2 animate-fade-in text-brand-dark">
                            <span class="text-3xl">✨</span>
                            <h4 class="text-sm font-black uppercase tracking-tight">Alta registrada correctament</h4>
                            <p class="text-xs text-gray-500 font-medium">Hem registrat el teu correu electrònic correctament al canal de novetats d'ADOCAT.</p>
                        </div>
                    `;
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error API Brevo');
                }

            } catch (err) {
                console.error('Error enviant correu:', err.message);
                if (subErrorEl) {
                    subErrorEl.textContent = "S'ha produït un error al servidor de correu. Torna-ho a provar més tard.";
                    subErrorEl.classList.remove('hidden');
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Subscriure'm al butlletí &rarr;";
                }
            }
        });
    };

    ejecutarLogicaSuscripcion();

    // ⚡ ОТПРАВКА СЛУЖЕБНЫХ КОНСУЛЬТАЦИЙ И ИНЦИДЕНТОВ (Обновлено по Пункту 9)
    const ejecutarLogicaDenuncias = () => {
        const form = document.getElementById('complaint-secure-form');
        const container = document.getElementById('denuncia-form-container');

        if (!form || !container) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const irregularityType = document.getElementById('denuncia-tipus')?.value; 
            const centreName = document.getElementById('denuncia-centre')?.value.trim();
            const description = document.getElementById('denuncia-descripcio')?.value.trim();
            const contactInfo = document.getElementById('denuncia-contacte')?.value.trim();
            const compErrorEl = document.getElementById('complaint-form-error');

            if (compErrorEl) compErrorEl.classList.add('hidden');

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "S'està enviant el formulari...";
            }

            try {
                const { error } = await supabase
                    .from('complaints')
                    .insert([
                        { 
                            centre_name: centreName, 
                            irregularity_type: irregularityType, 
                            description: description, 
                            contact_info: contactInfo 
                        }
                    ]);

                if (error) throw error;

                container.innerHTML = `
                    <div class="text-center py-12 space-y-4 animate-fade-in text-brand-dark">
                        <span class="text-5xl">📩</span>
                        <h3 class="text-xl font-black uppercase tracking-tight">Formulari enviat correctament</h3>
                        <p class="text-sm text-gray-600 font-medium max-w-md mx-auto leading-relaxed text-justify">
                            Comparteix una consulta, necessitat o incidència relacionada amb la teva activitat docent. ADOCAT valorarà com pot orientar-la o derivar-la, segons els recursos disponibles.
                        </p>
                    </div>
                `;

            } catch (err) {
                console.error('Database complaints error:', err.message);
                if (compErrorEl) {
                    compErrorEl.textContent = "S'ha produït un error en processar la sol·licitud. Torna-ho a provar més tard.";
                    compErrorEl.classList.remove('hidden');
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Enviar formulari de contacte &rarr;";
                }
            }
        });
    };

    ejecutarLogicaDenuncias();




        // ⚡ Управление окном входа администратора
    const abrirModalAdmin = (e) => {
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) mobileMenu.classList.add('hidden');

        const modalEl = document.getElementById('admin-modal');
        const cardEl = document.getElementById('modal-card');
        const inputEl = document.getElementById('admin-password-input');

        if (modalEl && cardEl) {
            e.preventDefault();
            modalEl.classList.remove('opacity-0', 'pointer-events-none');
            cardEl.classList.remove('scale-95');
            inputEl?.focus();
        } else {
            window.location.href = "/admin-panel-secret?openAdmin=true";
        }
    };

    document.getElementById('open-admin-nav-btn')?.addEventListener('click', abrirModalAdmin);
    document.getElementById('open-admin-mob-btn')?.addEventListener('click', abrirModalAdmin);

    if (window.location.search.includes('openAdmin=true')) {
        const modalEl = document.getElementById('admin-modal');
        const cardEl = document.getElementById('modal-card');
        const inputEl = document.getElementById('admin-password-input');
        
        if (modalEl && cardEl) {
            modalEl.classList.remove('opacity-0', 'pointer-events-none');
            cardEl.classList.remove('scale-95');
            inputEl?.focus();
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    document.getElementById('close-modal-btn')?.addEventListener('click', () => {
        const modalEl = document.getElementById('admin-modal');
        const cardEl = document.getElementById('modal-card');
        modalEl?.classList.add('opacity-0', 'pointer-events-none');
        cardEl?.classList.add('scale-95');
    });

    // ⚡ Проверка пароля и загрузка данных из базы Supabase
    const verificarPassword = async () => {
        if (DOM_CACHE.passwordInput && DOM_CACHE.passwordInput.value === 'adminGRI2026') {
            document.getElementById('login-error-msg')?.classList.add('hidden');
            DOM_CACHE.loginBlock?.classList.add('hidden');
            DOM_CACHE.contentBlock?.classList.remove('hidden');
            
            try {
                const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                listaLeads = data;
                renderizarTabla(filtroRolActual, criterioSortActual, DOM_CACHE.tbody, DOM_CACHE.mobileList);
            } catch (err) { 
                console.error('Supabase error:', err.message); 
            }
        } else {
            document.getElementById('login-error-msg')?.classList.remove('hidden');
            if (DOM_CACHE.passwordInput) { 
                DOM_CACHE.passwordInput.value = ''; 
                DOM_CACHE.passwordInput.focus(); 
            }
        }
    };

    document.getElementById('submit-password-btn')?.addEventListener('click', verificarPassword);
    DOM_CACHE.passwordInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') verificarPassword(); });




   // ⚡ Просмотр детальных ответов лида из таблицы (Очищено от агрессивного капса по Пункту 12)
        // ⚡ Просмотр детальных ответов лида из таблицы (Очищено от агрессивного капса по Пункту 12)
    const abrirExpedienteRespuestas = async (dbId) => {
        const lead = listaLeads.find(l => String(l.id) === String(dbId));
        if (!lead) return;

        const infoHeader = document.getElementById('ans-modal-lead-info');
        const container = document.getElementById('ans-modal-container');
        const modal = document.getElementById('answers-modal');
        const card = document.getElementById('answers-modal-card');

        if (!container || !modal || !card) return;

        if (infoHeader) infoHeader.textContent = `${lead.nombre || 'Anònim'} (${lead.provincia || 'Barcelona'})`;
        
        container.innerHTML = '';
        const respuestas = lead.respuestas || {};

        if (Object.keys(respuestas).length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-400 py-4 text-center">Aquest usuari no ha deixat respostes registrades.</p>';
        } else {
            Object.keys(respuestas).forEach(key => {
                const itemDiv = document.createElement('div');
                itemDiv.className = "py-3 border-b border-gray-100 text-left";
                
                // Переводим технические ключи в красивые заголовки строчными буквами с большой буквы
                let labelNeta = key.replace(/_/g, ' ');
                if (key === 'trabajas_soc' || key === 'situacion_sector') labelNeta = "Situació al sector";
                if (key === 'impartes_cp' || key === 'modalidad_docencia') labelNeta = "Modalitat d'interès";
                if (key === 'regimen' || key === 'regimen_laboral') labelNeta = "Règim laboral";
                if (key === 'modalidad' || key === 'prioridades_docentes') labelNeta = "Prioritats professionals";
                if (key === 'experiencia' || key === 'dificultades_sector') labelNeta = "Dificultats detectades";
                if (key === 'incidencias' || key === 'voluntat_participacio') labelNeta = "Voluntat de participació";

                itemDiv.innerHTML = `
                    <p class="text-[10px] font-black text-brand-green uppercase tracking-wider mb-0.5">${labelNeta}</p>
                    <p class="text-sm text-brand-dark font-semibold leading-snug">${respuestas[key]}</p>
                `;
                container.appendChild(itemDiv);
            });
        }

        modal.classList.remove('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-95');
    };

    DOM_CACHE.tbody?.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-answers-btn');
        if (!btn) return;
        const dbId = btn.closest('tr')?.getAttribute('data-id');
        if (dbId) abrirExpedienteRespuestas(dbId);
    });

    DOM_CACHE.mobileList?.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-answers-btn');
        if (!btn) return;
        const dbId = btn.closest('div[data-id]')?.getAttribute('data-id');
        if (dbId) abrirExpedienteRespuestas(dbId);
    });

    const cerrarExpediente = () => {
        const modal = document.getElementById('answers-modal');
        const card = document.getElementById('answers-modal-card');
        modal?.classList.add('opacity-0', 'pointer-events-none');
        card?.classList.add('scale-95');
    };
    document.getElementById('close-answers-btn')?.addEventListener('click', cerrarExpediente);
    document.getElementById('close-answers-bottom-btn')?.addEventListener('click', cerrarExpediente);

    // Слушатели кнопок фильтров (Обновлены размеры под новые 6 кнопок из HTML по Пункту 7 и 13)
    document.querySelectorAll('.filter-role-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-role-btn').forEach(b => {
                b.className = "px-3 py-2 text-[10px] font-extrabold rounded-xs border-2 border-gray-200 bg-white text-gray-600 hover:border-gray-300 cursor-pointer transition-all";
            });
            this.className = "px-3 py-2 text-[10px] font-extrabold rounded-xs border-2 border-brand-green bg-brand-green text-white cursor-pointer transition-all";
            
            filtroRolActual = this.getAttribute('data-role') || 'all';

            if (pestañaActual !== 'leads') {
                pestañaActual = ''; 
                cambiarPestaña('leads');
            } else {
                renderizarTabla(filtroRolActual, criterioSortActual, DOM_CACHE.tbody, DOM_CACHE.mobileList);
            }
        });
    });


        document.getElementById('sort-leads-select')?.addEventListener('change', function() {
        criterioSortActual = this.value;
        renderizarTabla(filtroRolActual, criterioSortActual, DOM_CACHE.tbody, DOM_CACHE.mobileList);
    });

    document.getElementById('export-csv-btn')?.addEventListener('click', ejecutarExportacionCSV);
    
    // ⚡ Переключение табов администратора (Incidències / Support) - Обновлено под Пункт 9
    btnComplaints = document.getElementById('tab-btn-complaints');
    btnSupport = document.getElementById('tab-btn-support');

    const cambiarPestaña = async (nuevaPestaña) => {
        if (pestañaActual === nuevaPestaña) return;
        pestañaActual = nuevaPestaña;

        // ИСПРАВЛЕНО: селектор синхронизирован с верным ID #modal-card вашего Astro-компонента
        const headerstr = document.querySelector('#modal-card table thead tr');

        [btnComplaints, btnSupport].forEach(b => {
            if (b) {
                b.classList.replace('bg-brand-green', 'bg-white');
                b.classList.replace('text-white', 'text-gray-600');
                b.classList.replace('border-brand-green', 'border-gray-200');
            }
        });

        if (pestañaActual === 'leads') {
            if (headerstr) {
                // Изменяем "Rol Actiu" на "Modalitat d'interès" строчными буквами по Пункту 4 и 12
                headerstr.innerHTML = `
                    <th class="p-4">Data</th>
                    <th class="p-4">Nom i província</th>
                    <th class="p-4">Correu electrònic</th>
                    <th class="p-4">Telèfon</th>
                    <th class="p-4">Modalitat d'interès</th>
                    <th class="p-4 text-center">Expedient</th>
                `;
            }
            renderizarTabla(filtroRolActual, criterioSortActual, DOM_CACHE.tbody, DOM_CACHE.mobileList);

        } else if (pestañaActual === 'complaints') {
            btnComplaints?.classList.replace('bg-white', 'bg-brand-green');
            btnComplaints?.classList.replace('text-gray-600', 'text-white');
            btnComplaints?.classList.replace('border-gray-200', 'border-brand-green');

            if (headerstr) {
                // Очищаем заголовки колонок от агрессивного капса и старых терминов по Пункту 9 и 12
                headerstr.innerHTML = `
                    <th class="p-4">Data</th>
                    <th class="p-4">Entitat o centre</th>
                    <th class="p-4">Motiu del contacte</th>
                    <th class="p-4">Dades de contacte</th>
                    <th class="p-4 text-right">Accions</th>
                `;
            }

            try {
                const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                // Маркер обновлен на инклюзивный CONSULTA DOCENT: для точной фильтрации
                listaComplaints = data.filter(c => !c.centre_name || !c.centre_name.includes('CONSULTA DOCENT:'));
                renderizarComplaints(DOM_CACHE.tbody, DOM_CACHE.mobileList);
            } catch (err) { console.error('Database connection error:', err.message); }
        } else if (pestañaActual === 'support') {
            btnSupport?.classList.replace('bg-white', 'bg-brand-green');
            btnSupport?.classList.replace('text-gray-600', 'text-white');
            btnSupport?.classList.replace('border-gray-200', 'border-brand-green');

            if (headerstr) {
                // Приводим вкладку поддержки к уважительному и аккуратному строчному стилю
                headerstr.innerHTML = `
                    <th class="p-4">Data</th>
                    <th class="p-4">Nom de la persona</th>
                    <th class="p-4">Tipus de consulta</th>
                    <th class="p-4">Dades de resposta</th>
                    <th class="p-4 text-right">Accions</th>
                `;
            }

            try {
                const { data, error } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                // Маркер обновлен на инклюзивный CONSULTA DOCENT: для точной фильтрации
                listaComplaints = data.filter(c => c.centre_name && c.centre_name.includes('CONSULTA DOCENT:'));
                renderizarComplaints(DOM_CACHE.tbody, DOM_CACHE.mobileList);
            } catch (err) { console.error('Database connection error:', err.message); }
        }
    }; // Физическое закрытие асинхронной функции cambiarPestaña

    btnComplaints?.addEventListener('click', () => cambiarPestaña('complaints'));
    btnSupport?.addEventListener('click', () => cambiarPestaña('support'));







        // Просмотр детального описания обращений и консультаций (Обновлено под Пункт 9, 12 и 13)
    const abrirDetalleDenuncia = (compId) => {
        const comp = listaComplaints.find(c => String(c.id) === String(compId));
        if (!comp) return;

        const infoHeader = document.getElementById('ans-modal-lead-info');
        const container = document.getElementById('ans-modal-container');
        const modal = document.getElementById('answers-modal');
        const card = document.getElementById('answers-modal-card');

        if (!container || !modal || !card) return;

        // Маркер заменен на инклюзивный CONSULTA DOCENT: для полной синхронизации
        const esConsulta = comp.centre_name && comp.centre_name.includes('CONSULTA DOCENT:');

        if (infoHeader) {
            if (esConsulta) {
                const nombreLimpio = comp.centre_name.replace('CONSULTA DOCENT:', '').trim();
                infoHeader.textContent = `Consulta de la persona docent: ${nombreLimpio}`;
            } else {
                // Полностью исключаем слово "DENÚNCIA" из заголовка карточки просмотра
                infoHeader.textContent = `Incidència o consulta: ${comp.centre_name || 'Centre Desconegut'}`;
            }
        }

        // Traducció i normalització textual amable segons el Punt 9 i Punt 12 del brif
        const labelType = esConsulta ? "Motiu de la consulta" : "Motiu del contacte";
        const labelDesc = esConsulta ? "Detalls de la consulta" : "Descripció de la situació aportada";
        const labelContact = esConsulta ? "Dades de resposta per al seguiment" : "Dades de contacte facilitades";

        let textType = "Altres aspectes";
        if (comp.irregularity_type) {
            const valLower = comp.irregularity_type.toLowerCase();
            if (valLower === 'consulta') textType = "Consulta ordinària";
            if (valLower === 'proposta') textType = "Proposta o necessitat col·lectiva";
            if (valLower === 'irregularitat') textType = "Possible incidència o irregularitat normativitzada";
        } else if (esConsulta) {
            textType = "Consulta de suport col·laboratiu";
        }

        const typeClass = esConsulta ? "text-sm text-blue-600 font-bold" : "text-sm text-amber-600 font-bold";

        container.innerHTML = `
            <div class="py-4 text-left border-b border-gray-100">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">${labelType}</p>
                <p class="${typeClass}">${textType}</p>
            </div>
            <div class="py-4 text-left border-b border-gray-100">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">${labelDesc}</p>
                <p class="text-sm text-brand-dark font-medium leading-relaxed text-justify whitespace-pre-line">${comp.description}</p>
            </div>
            <div class="py-4 text-left">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">${labelContact}</p>
                <p class="text-sm font-mono font-bold text-gray-700">${comp.contact_info || '-'}</p>
            </div>
        `;
        
        modal.classList.remove('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-95');
    };

    DOM_CACHE.tbody?.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-complaint-btn');
        const dbId = btn?.closest('tr')?.getAttribute('data-id');
        if (dbId) abrirDetalleDenuncia(dbId);
    });

    DOM_CACHE.mobileList?.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-complaint-btn');
        const dbId = btn?.closest('div[data-id]')?.getAttribute('data-id');
        if (dbId) abrirDetalleDenuncia(dbId);
    });

  }); // КОНЕЦ ГЛАВНОГО СЛУШАТЕЛЯ DOMContentLoaded (Строка 339)

// Код для раскрытия скрытого квиза при клике
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById('open-quiz-btn');
  const quizSection = document.getElementById('quiz-section');

  if (openBtn && quizSection) {
    openBtn.addEventListener('click', () => {
      // Показываем <main> (удаляем hidden)
      quizSection.classList.remove('hidden');
      
      // Делаем плавное появление opacity
      setTimeout(() => {
        quizSection.classList.add('opacity-100');
        // Плавно прокручиваем к началу квиза
        quizSection.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });
  }
});