/**
 * ===================================================================
 * Counter Selectors — demo NgRx căn bản
 * 📖 Lý thuyết: 14-ngrx.md (Selectors)
 * ===================================================================
 */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CounterState } from './counter.state';

export const selectCounterState = createFeatureSelector<CounterState>('counter');

export const selectCount = createSelector(
  selectCounterState,
  (s) => s.count,
);

export const selectPending = createSelector(
  selectCounterState,
  (s) => s.pending,
);

export const selectLastUpdated = createSelector(
  selectCounterState,
  (s) => s.lastUpdated,
);

