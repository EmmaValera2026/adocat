/// <reference types="astro/client" />
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.avif';
declare module '*.jfif';

/// <reference types="astro/client" />
declare module '*.css' {
  const content: any;
  export default content;
}
