// Заменяем "astro:page-load" на стандартную самовызывающуюся функцию с проверкой DOM
(function initMenuAndTabs() {
    
    // Функция инициализации, которую мы вызовем сразу и при перехвате изменений
    function setup() {
        // === 1. МУЛЬТИЯЗЫЧНОЕ МОБИЛЬНОЕ МЕНЮ ===
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        if (menuToggle && mobileMenu) {
            // Очищаем старые слушатели, если они были, чтобы избежать дублирования
            menuToggle.replaceWith(menuToggle.cloneNode(true));
            const freshToggle = document.getElementById('menu-toggle');
            
            freshToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                mobileMenu.classList.toggle('hidden');
                mobileMenu.classList.toggle('flex');
                mobileMenu.classList.toggle('flex-col');
            });
        }

        // === 2. СКРЫТЫЙ БЭКДОР ДЛЯ АДМИНИСТРАТОРА ===
        const brandText = document.querySelector('header span.text-2xl');
        if (brandText) {
            brandText.style.cursor = 'default';
            brandText.style.userSelect = 'none';
            brandText.addEventListener('click', () => {
                window.location.href = '/admin-panel-secret';
            });
        }

        // === 3. ДИНАМИЧЕСКИЕ ВКЛАДКИ ЮРИДИЧЕСКИХ СТРАНИЦ ===
        checkLegalTab();
    }

    function checkLegalTab() {
        if (!window.location.pathname.includes('/legal')) return;
        const currentHash = window.location.hash || '#avis';
        const sections = ['#avis', '#privacitat', '#cookies'];
        
        sections.forEach(sectionId => {
            const element = document.querySelector(sectionId);
            if (element) {
                if (sectionId === currentHash) {
                    element.classList.remove('hidden');
                } else {
                    element.classList.add('hidden');
                }
            }
        });
    }

    // Запуск логики
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }

    window.addEventListener('hashchange', checkLegalTab);
})();
