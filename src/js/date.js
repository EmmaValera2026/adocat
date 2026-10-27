// 📜 CONFIGURACIÓ DE PREGUNTES I SEGMENTACIÓ ADOCAT
export const QUIZ_QUESTIONS = [
    { 
        id: "trabajas_soc", 
        text: "Quina és la teva situació actual respecte al sector de la formació per a l'ocupació?", 
        options: [
            "Imparteixo formació activa per al SOC", 
            "Imparteixo formació en altres àmbits / privats",
            "Sóc tutor/a o coordinador/a pedagògic/a", // Corregit de 'coordinator/a' a 'coordinador/a'
            "Estic en cerca de centre per incorporar-me al sector",
            "Altres"
        ] 
    },
    { 
        id: "impartes_cp", 
        text: "Quina modalitat d'ensenyament imparteixes o t'interessa principalment?", 
        options: [
            "Presencial", 
            "Teleformació / En línia", 
            "Tutoria de formació", 
            "Mixta (Híbrida)",
            "Altres"
        ] 
    },
    { 
        id: "regimen", 
        text: "Quin és el teu règim laboral principal en la docència?", 
        options: [
            "Autònom / Contracte mercantil", 
            "Assalariat / Contracte laboral", 
            "En cerca d'oportunitat laboral",
            "Altres"
        ] 
    },
    { 
        id: "modalidad", 
        text: "Quines són les teves principals prioritats o necessitats com a docent? (Pots seleccionar diverses opcions)", 
        options: [
            "Millorar les condicions laborals i salarials", 
            "Accedir a recursos didàctics compartits de qualitat", 
            "Disposar d'espais de trobada i comunitat", 
            "Rebre orientació professional actualitzada",
            "Altres"
        ],
        multiple: true // Permet selecció múltiple tal com demana el tutor
    },
    { 
        id: "experiencia", 
        text: "Quines dificultats trobes habitualment en el desenvolupament de la teva activitat? (Pots seleccionar diverses opcions)", 
        options: [
            "Gestió administrativa complexa o retards", 
            "Manca de materials pedagògics / exàmens de referència", 
            "Aïllament professional / Manca de suport del col·lectiu", 
            "Cap incidència destacable",
            "Altres"
        ],
        multiple: true // Permet selecció múltiple tal com demana el tutor
    },
    { 
        id: "incidencias", 
        text: "Com t'agradaria participar o col·laborar amb la comunitat d'ADOCAT?", 
        options: [
            "Vull associar-me i rebre informació activa", 
            "Vull participar en comissions de treball pedagògic", 
            "Només vull rebre el butlletí de novetats (requereix consentiment específic)", // Actualitzat per reflectir la norma del tutor
            "Altres"
        ] 
    }
];

export const DEMO_USER_PROFILE = {
    nombre: "Carles Quintana i Serra",
    email: "c.quintana@correu.cat",
    provincia: "Girona",
    status: "Persona associada",
    statusClass: "bg-emerald-50 text-brand-green border-emerald-100",
    idAfiliat: "SO-2026-8492", 
    dataAlta: "14/02/2026"
};