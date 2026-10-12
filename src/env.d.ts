/// <reference types="astro/client" />
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';

/// <reference types="astro/client" />
declare module '*.css' {
  const content: any;
  export default content;
}
