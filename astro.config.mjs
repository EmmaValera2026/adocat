import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite'; 
import sitemap from '@astrojs/sitemap';
import vitePWA from '@vite-pwa/astro'; // 📱 Подключаем мобильный PWA-плагин
import netlify from '@astrojs/netlify'; // 🚀 Подключаем серверный адаптер Netlify

export default defineConfig({
  site: 'https://socis.adocat.es',

  // 🚀 Переключаем сайт в гибридный режим, чтобы работали серверные функции и формы
  output: 'server',
  adapter: netlify(),

  integrations: [
    sitemap(),
    
    // 📱 Конфигурация мобильного приложения для смартфонов
    vitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ADOCAT — Associació de Docents',
        short_name: 'ADOCAT',
        description: "Plataforma oficial de l'Associació de Docents de Formació Ocupacional de Catalunya",
        theme_color: '#15803d', 
        background_color: '#ffffff',
        display: 'standalone', // Запуск приложения во весь экран без рамок браузера
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Кэшируем файлы сайта в память телефона, чтобы приложение открывалось мгновенно
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}'],
        // 🛠 Увеличиваем лимит кэширования для файлов размером больше 2 МБ (например, для emma_grupo.png)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      }
    })
  ],

  vite: {
    plugins: [tailwindcss()] 
  },
});