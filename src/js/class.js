import { QUIZ_QUESTIONS } from './date.js'; 
import { supabase } from './supabaseClient.js';

export class QuizEngine {
    constructor(onStateChange) {
        this.currentIndex = 0;
        this.responses = {}; 
        this.onStateChange = onStateChange; 
    }

    // ⚡ Запуск квиза
    start = () => {
        this.restoreSession();
        this.notify();
    };

    nextStep = () => {
        if (this.currentIndex < QUIZ_QUESTIONS.length) {
            this.currentIndex++;
            this.notify();
        }
    };

    prevStep = () => {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.notify();
        }
    };

    saveAnswer = (questionId, value) => {
        this.responses[questionId] = value;
        const sessionData = {
            timestamp: Date.now(),
            responses: this.responses
        };
        localStorage.setItem('adocat_answers_session', JSON.stringify(sessionData));
        this.notify();
    };

    getQuizState = () => {
        const totalSteps = QUIZ_QUESTIONS.length;
        const currentQuestion = this.currentIndex < totalSteps ? QUIZ_QUESTIONS[this.currentIndex] : null;
        
        // Переводим внутреннее состояние в нейтральный информационный режим 
        return {
            currentIndex: this.currentIndex,
            totalSteps: totalSteps,
            percent: Math.round((this.currentIndex / totalSteps) * 100),
            currentProgress: Math.round(((this.currentIndex + 1) / totalSteps) * 100),
            isFirstStep: this.currentIndex === 0,
            isQuizFinished: this.currentIndex >= totalSteps,
            currentQuestion: currentQuestion ? {
                ...currentQuestion,
                savedAnswer: this.responses[currentQuestion.id] || null
            } : null,
            result: {
                isPrecario: false,
                title: "Perfil docent registrat correctament",
                icon: "📋",
                lineClass: "absolute top-0 left-0 right-0 h-2 bg-brand-green",
                description: "Gràcies per compartir la teva realitat docent. Les teves respostes han estat recollides de manera segura i ens ajuden a conèixer millor les necessitats actuals del col·lectiu (presencial, teleformació i tutoria) per orientar les prioritats de suport d'ADOCAT. Aquesta recollida de dades té una finalitat exclusivament informativa i cooperativa, i en cap cas constitueix una valoració jurídica automàtica."
            }
        };
    };

    notify = () => {
        if (this.onStateChange) {
            this.onStateChange(this.getQuizState());
        }
    };

    saveLeadToDatabase = async (userData) => {
        try {
            // Очищаем email и имя от лишних пробелов перед отправкой
            const cleanEmail = userData.email ? userData.email.trim().toLowerCase() : '';
            const cleanNombre = userData.nombre ? userData.nombre.trim().replace(/\s+/g, ' ') : '';
            const cleanTelefono = userData.telefono ? userData.telefono.trim() : '';

            // 1. Авторегистрация пользователя в Supabase Auth
            if (cleanEmail && cleanTelefono.length >= 6) {
                try {
                    await supabase.auth.signUp({
                        email: cleanEmail,
                        password: cleanTelefono,                        
                        options: {
                            data: {
                                nombre: cleanNombre,
                                provincia: userData.provincia,
                                role_implicacion: userData.role
                            }
                        }
                    });
                } catch (authErr) {
                    console.warn('Auth auto-signup status:', authErr.message);
                }
            }

            // 2. Прямая запись анкеты и контактов в таблицу leads (историческая накопительная вставка)
            const { error } = await supabase
                .from('leads')
                .insert([
                    {
                        nombre: cleanNombre,
                        email: cleanEmail,
                        telefono: cleanTelefono,
                        provincia: userData.provincia || null,
                        modalidad_implicacion: userData.role || 'butlleti',
                        app_origen: 'adocat',
                        respuestas: this.responses
                    }
                ]);

            if (error) throw error;

            // 3. Интеграция с бэкенд-эндпоинтом (/api/subscribe) для писем и Brevo
            try {
                await fetch('/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: cleanEmail,
                        nombre: cleanNombre,
                        telefono: cleanTelefono,
                        provincia: userData.provincia,
                        role: userData.role,
                        respuestas: this.responses
                    })
                });
            } catch (brevoErr) {
                console.error('Brevo sync post-error:', brevoErr.message);
            }

            // 4. Очистка кэша сессии после успешной отправки
            localStorage.removeItem('adocat_answers_session');
            return { success: true };

        } catch (err) {
            console.error('Database error:', err.message);
            return { success: false, error: err.message };
        }
    };

    restoreSession = () => {
        const cache = localStorage.getItem('adocat_answers_session');
        if (!cache) return;
        
        try {
            const sessionData = JSON.parse(cache);
            const hrs24 = 24 * 60 * 60 * 1000;

            if (Date.now() - sessionData.timestamp > hrs24) {
                localStorage.removeItem('adocat_answers_session');
                this.responses = {};
                this.currentIndex = 0;
            } else {
                this.responses = sessionData.responses || {};
                this.currentIndex = Object.keys(this.responses).length;
                
                if (this.currentIndex > QUIZ_QUESTIONS.length) {
                    this.currentIndex = 0;
                    this.responses = {};
                }
            }
        } catch (e) {
            localStorage.removeItem('adocat_answers_session');
            this.responses = {};
            this.currentIndex = 0;
        }
    };
}

