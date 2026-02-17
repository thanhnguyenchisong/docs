/**
 * ===================================================================
 * main.ts — Entry point: Bootstrap ứng dụng Angular
 * 📖 Lý thuyết: 02-angular-fundamentals.md (Bootstrap application)
 * ===================================================================
 *
 * bootstrapApplication() khởi tạo Angular app với:
 *   - Root component (AppComponent)
 *   - Application config (providers: router, HTTP, store, ...)
 *
 * Đây là cách bootstrap cho Standalone Components (Angular 14+).
 * Không cần AppModule (NgModule) — dự án mới nên dùng standalone.
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('Bootstrap failed:', err));
