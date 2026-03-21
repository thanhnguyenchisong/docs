/**
 * ===================================================================
 * Counter Effects — demo NgRx (async side effect)
 * 📖 Lý thuyết: 14-ngrx.md (Effects)
 * ===================================================================
 */
import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CounterActions } from './counter.actions';

@Injectable()
export class CounterEffects {
  private readonly actions$ = inject(Actions);

  incrementAsync$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CounterActions.incrementAsync),
      switchMap(({ step, delayMs }) =>
        timer(delayMs ?? 800).pipe(
          map(() => CounterActions.incrementBy({ step })),
        ),
      ),
    ),
  );
}

