/**
 * ===================================================================
 * Route Animations — Hiệu ứng chuyển trang
 * 📖 Lý thuyết: 11-ui-styling.md (Angular Animations)
 * ===================================================================
 *
 * Angular Animations concepts:
 *   - trigger: Tên animation, gắn vào template bằng @triggerName
 *   - state: Style cho một trạng thái (open, closed)
 *   - transition: Chuyển đổi giữa states (:enter, :leave, A => B)
 *   - animate: Thời gian + easing ('300ms ease-in')
 *   - query/stagger: Animation cho danh sách (lần lượt từng item)
 *   - group: Chạy nhiều animation song song
 *
 * Cần: provideAnimationsAsync() trong app.config.ts
 */
import {
  trigger, transition, style, animate,
  query, state,
  stagger,
} from '@angular/animations';

// ═══════════════════════════════════════════════════════════════════
// 1. ROUTE ANIMATION — Hiệu ứng chuyển trang (slide)
// ═══════════════════════════════════════════════════════════════════
/**
 * Dùng trên <router-outlet> trong app.component:
 *   <div [@routeAnimation]="getRouteAnimationState(outlet)">
 *     <router-outlet #outlet="outlet" />
 *   </div>
 */
export const routeAnimation = trigger('routeAnimation', [
  // Từ trang bất kỳ sang trang bất kỳ
  transition('* <=> *', [
    // Style ban đầu cho page đang vào
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(20px)' }),
    ], { optional: true }),

    // Animate page đang rời đi
    query(':leave', [
      animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-20px)' })),
    ], { optional: true }),

    // Animate page đang vào
    query(':enter', [
      animate('300ms ease-in', style({ opacity: 1, transform: 'translateY(0)' })),
    ], { optional: true }),
  ]),
]);

// ═══════════════════════════════════════════════════════════════════
// 2. FADE IN/OUT — Hiệu ứng ẩn hiện
// ═══════════════════════════════════════════════════════════════════
/**
 * Dùng với @if:
 *   @if (visible) {
 *     <div @fadeInOut>Nội dung</div>
 *   }
 *
 * 📖 Bài 11: :enter = void => * (element được thêm vào DOM)
 *           :leave = * => void (element bị xóa khỏi DOM)
 */
export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 })),
  ]),
  transition(':leave', [
    animate('200ms ease-out', style({ opacity: 0 })),
  ]),
]);

// ═══════════════════════════════════════════════════════════════════
// 3. SLIDE IN/OUT — Trượt từ bên
// ═══════════════════════════════════════════════════════════════════
export const slideInOut = trigger('slideInOut', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 })),
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 })),
  ]),
]);

// ═══════════════════════════════════════════════════════════════════
// 4. EXPAND/COLLAPSE — Mở rộng / thu gọn
// ═══════════════════════════════════════════════════════════════════
/**
 * 📖 Bài 11: state() — định nghĩa style cho một trạng thái
 * Dùng: <div [@expandCollapse]="isExpanded ? 'expanded' : 'collapsed'">
 */
export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({ height: '0', overflow: 'hidden', opacity: 0 })),
  state('expanded', style({ height: '*', overflow: 'visible', opacity: 1 })),
  transition('collapsed <=> expanded', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'),
  ]),
]);

// ═══════════════════════════════════════════════════════════════════
// 5. LIST STAGGER — Animation lần lượt cho danh sách
// ═══════════════════════════════════════════════════════════════════
/**
 * 📖 Bài 11: stagger — delay mỗi item để tạo hiệu ứng "rải" từng cái
 *
 * Dùng trên container:
 *   <div @listAnimation>
 *     @for (item of items; track item.id) {
 *       <div>{{ item.name }}</div>
 *     }
 *   </div>
 */
export const listAnimation = trigger('listAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      stagger('50ms', [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ], { optional: true }),
  ]),
]);
