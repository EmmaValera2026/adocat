import { createClient } from '@supabase/supabase-js';
import { QUIZ_QUESTIONS } from './date.js'; 

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        
        // Переводим внутреннее состояние в нейтральный информационный режим по Пункту 8 брифа
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
            // 1. Ваша оригинальная авторегистрация пользователя в Supabase
            if (userData.email && userData.telefono.length >= 6) {
                try {
                    await supabase.auth.signUp({
                        email: userData.email,
                        password: userData.telefono,                        
                        options: {
                            data: {
                                nombre: userData.nombre,
                                provincia: userData.provincia,
                                role_implicacion: userData.role
                            }
                        }
                    });
                } catch (authErr) {
                    console.warn('Auth auto-signup status:', authErr.message);
                }
            }

            // 2. Ваша original прямая запись анкеты и контактов в таблицу leads
            const { error } = await supabase
                .from('leads')
                .insert([
                    {
                        nombre: userData.nombre,
                        email: userData.email,
                        telefono: userData.telefono,
                        provincia: userData.provincia,
                        modalidad_implicacion: userData.role,
                        app_origen: 'adocat',
                        respuestas: this.responses
                    }
                ]);

            if (error) throw error;

            // 3. Добавляем параллельную интеграцию с Brevo без удаления старого кода (Пункт 14)
            try {
                await fetch('/api/save-lead-brevo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: userData.email,
                        nombre: userData.nombre,
                        telefono: userData.telefono,
                        provincia: userData.provincia,
                        role: userData.role,
                        respuestas: this.responses
                    })
                });
            } catch (brevoErr) {
                console.error('Brevo sync post-error:', brevoErr.message);
                // Не прерываем выполнение, если Brevo временно недоступен, так как в Supabase данные уже ушли
            }

            // 4. Ваша original очистка кэша сессии после успешной отправки
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

