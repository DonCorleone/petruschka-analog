/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  build: {
    target: ['es2020'],
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@angular/core', '@angular/common', '@angular/platform-browser'],
          dialog: ['@angular/cdk/dialog'],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase warning limit to 600kB
    minify: mode === 'production' ? 'esbuild' : false,
    // Use esbuild instead of terser for faster builds and SSR compatibility
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    analog(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
  define: {
    'ngDevMode': mode === 'production' ? 'false' : 'true',
    'import.meta.vitest': mode !== 'production',
  },
}));
