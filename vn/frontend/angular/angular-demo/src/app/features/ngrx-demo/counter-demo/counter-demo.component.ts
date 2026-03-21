/**
 * ===================================================================
 * CounterDemoComponent — demo NgRx (dispatch + selectors + effects)
 * 📖 Lý thuyết: 14-ngrx.md
 * ===================================================================
 */
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CounterActions } from '../store/counter.actions';
import { selectCount, selectLastUpdated, selectPending } from '../store/counter.selectors';

@Component({
  selector: 'app-counter-demo',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container">
      <h1>Demo NgRx — Counter</h1>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Store state</mat-card-title>
          <mat-card-subtitle>
            @if (pending()) { Đang xử lý async... } @else { Sẵn sàng }
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content class="grid">
          <div class="kpi">
            <div class="label">count</div>
            <div class="value">{{ count() }}</div>
          </div>

          <div class="kpi">
            <div class="label">lastUpdated</div>
            <div class="value">{{ lastUpdatedText() }}</div>
          </div>

          <div class="actions">
            <button mat-raised-button color="primary" (click)="inc()">
              <mat-icon>add</mat-icon> +1
            </button>
            <button mat-raised-button color="accent" (click)="dec()">
              <mat-icon>remove</mat-icon> -1
            </button>
            <button mat-stroked-button (click)="reset()">
              <mat-icon>restart_alt</mat-icon> Reset
            </button>
          </div>

          <div class="actions">
            <button mat-raised-button (click)="incBy(5)">+5</button>
            <button mat-raised-button (click)="incBy(10)">+10</button>
            <button mat-raised-button color="warn" (click)="set(0)">Set 0</button>
          </div>

          <div class="actions">
            <button mat-raised-button (click)="incAsync(1)">
              Async +1 (800ms)
            </button>
            <button mat-raised-button (click)="incAsync(10, 1500)">
              Async +10 (1500ms)
            </button>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Set count</mat-label>
            <input matInput type="number" [value]="draft()" (input)="onDraft($event)" />
          </mat-form-field>
          <div class="actions">
            <button mat-raised-button color="primary" (click)="applyDraft()">
              Apply
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .grid { display: grid; gap: 16px; }
    .kpi { padding: 12px; border: 1px solid rgba(0,0,0,0.12); border-radius: 8px; }
    .label { font-size: 12px; opacity: 0.75; }
    .value { font-size: 24px; font-weight: 700; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; }
    mat-form-field { width: 280px; }
  `],
})
export class CounterDemoComponent {
  private readonly store = inject(Store);

  // NgRx selectors → Signal
  readonly count = this.store.selectSignal(selectCount);
  readonly pending = this.store.selectSignal(selectPending);
  private readonly lastUpdated = this.store.selectSignal(selectLastUpdated);

  readonly lastUpdatedText = computed(() => {
    const ts = this.lastUpdated();
    return ts ? new Date(ts).toLocaleString() : '—';
  });

  readonly draft = signal<number>(0);

  inc(): void {
    this.store.dispatch(CounterActions.increment());
  }

  dec(): void {
    this.store.dispatch(CounterActions.decrement());
  }

  reset(): void {
    this.store.dispatch(CounterActions.reset());
  }

  incBy(step: number): void {
    this.store.dispatch(CounterActions.incrementBy({ step }));
  }

  set(count: number): void {
    this.store.dispatch(CounterActions.setCount({ count }));
  }

  incAsync(step: number, delayMs?: number): void {
    this.store.dispatch(CounterActions.incrementAsync({ step, delayMs }));
  }

  onDraft(ev: Event): void {
    const value = (ev.target as HTMLInputElement).valueAsNumber;
    this.draft.set(Number.isFinite(value) ? value : 0);
  }

  applyDraft(): void {
    this.store.dispatch(CounterActions.setCount({ count: this.draft() }));
  }
}

