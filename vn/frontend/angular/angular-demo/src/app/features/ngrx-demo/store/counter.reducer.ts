/**
 * ===================================================================
 * Counter Reducer — (state, action) => state mới
 * 📖 Lý thuyết: 14-ngrx.md (Reducers)
 * ===================================================================
 */
import { createReducer, on } from '@ngrx/store';
import { initialCounterState } from './counter.state';
import { CounterActions } from './counter.actions';

export const counterReducer = createReducer(
  initialCounterState,

  on(CounterActions.increment, (state) => ({
    ...state,
    count: state.count + 1,
    pending: false,
    lastUpdated: Date.now(),
  })),

  on(CounterActions.decrement, (state) => ({
    ...state,
    count: state.count - 1,
    pending: false,
    lastUpdated: Date.now(),
  })),

  on(CounterActions.incrementBy, (state, { step }) => ({
    ...state,
    count: state.count + step,
    pending: false,
    lastUpdated: Date.now(),
  })),

  on(CounterActions.setCount, (state, { count }) => ({
    ...state,
    count,
    pending: false,
    lastUpdated: Date.now(),
  })),

  on(CounterActions.reset, (state) => ({
    ...state,
    count: 0,
    pending: false,
    lastUpdated: Date.now(),
  })),

  on(CounterActions.incrementAsync, (state) => ({
    ...state,
    pending: true,
  })),
);

