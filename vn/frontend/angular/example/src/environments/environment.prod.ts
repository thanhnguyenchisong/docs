/**
 * ===================================================================
 * environment.prod.ts — Cấu hình môi trường Production
 * 📖 Lý thuyết: 13-build-deploy.md (Environments, Build)
 * ===================================================================
 *
 * File này thay thế environment.ts khi build production:
 *   ng build --configuration=production
 *
 * Production build: minify, tree-shake, AOT compile.
 */
export const environment = {
  production: true,
  apiUrl: 'https://api.myapp.com/api',
  appName: 'Angular Demo',

  features: {
    enableDarkMode: true,
    enableAnalytics: true,   // Bật analytics chỉ ở production
  },
};
