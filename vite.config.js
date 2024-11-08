import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@svgdotjs/svg.js']
  }
});