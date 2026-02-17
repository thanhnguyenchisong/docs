/**
 * ===================================================================
 * InjectionToken — Inject giá trị không phải class
 * 📖 Lý thuyết: 05-services-di.md (Senior/Master → InjectionToken)
 * ===================================================================
 *
 * Vấn đề: Angular DI dùng class làm token. Nhưng khi cần inject
 * một interface, object config, string (API URL) — không có class.
 *
 * Giải pháp: InjectionToken<T> tạo token unique, dùng provide/inject.
 *
 * Dùng khi:
 *   - Inject config object (AppConfig, API_URL)
 *   - Inject giá trị primitive (string, number)
 *   - Inject interface (không phải class)
 */
import { InjectionToken } from '@angular/core';
import { AppConfig } from '@core/models';

/**
 * Token cho app config — provide trong app.config.ts
 *
 * Cách dùng:
 *   providers: [{ provide: APP_CONFIG, useValue: environment }]
 *
 * Cách inject:
 *   private config = inject(APP_CONFIG);
 */
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

/**
 * Token cho API base URL — ví dụ inject string
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
