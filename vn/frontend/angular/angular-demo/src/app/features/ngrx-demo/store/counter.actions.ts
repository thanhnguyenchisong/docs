/**
 * ===================================================================
 * Counter Actions — demo NgRx căn bản
 * 📖 Lý thuyết: 14-ngrx.md (Actions)
 * ===================================================================
 */
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const CounterActions = createActionGroup({
  source: 'Counter Demo',
  events: {
    Increment: emptyProps(),
    Decrement: emptyProps(),
    Reset: emptyProps(),
    'Increment By': props<{ step: number }>(),
    'Set Count': props<{ count: number }>(),
    'Increment Async': props<{ step: number; delayMs?: number }>(),
  },
});

