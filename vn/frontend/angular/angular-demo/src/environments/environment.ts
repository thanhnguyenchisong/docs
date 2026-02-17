/**
 * ===================================================================
 * environment.ts — Cấu hình môi trường Development
 * 📖 Lý thuyết: 13-build-deploy.md (Environments)
 * ===================================================================
 *
 * File này chứa config cho môi trường DEV.
 * Khi build production, Angular CLI thay thế file này bằng environment.prod.ts
 * (cấu hình trong angular.json → fileReplacements).
 *
 * Import trong code: import { environment } from '@env/environment';
 * KHÔNG COMMIT secret/key thật vào đây.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Angular Demo (DEV)',

  // Feature flags — bật/tắt tính năng theo môi trường
  features: {
    enableDarkMode: true,
    enableAnalytics: false,
  },
};
