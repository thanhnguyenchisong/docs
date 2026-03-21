/**
 * ===================================================================
 * Counter State — demo NgRx căn bản
 * 📖 Lý thuyết: 14-ngrx.md (State)
 * ===================================================================
 */
export interface CounterState {
  count: number;
  pending: boolean;
  lastUpdated: number | null;
}

export const initialCounterState: CounterState = {
  count: 0,
  pending: false,
  lastUpdated: null,
};

