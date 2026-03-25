import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { TranslatePipe, TranslationService } from '@core';
import { ButtonModule } from 'primeng/button';

export type ApiFeedbackTone = 'error' | 'empty';

@Component({
  selector: 'app-api-feedback',
  standalone: true,
  imports: [TranslatePipe, ButtonModule],
  templateUrl: './api-feedback.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiFeedbackComponent {
  readonly tone = input<ApiFeedbackTone>('error');

  /** i18n key for the title line. */
  readonly titleKey = input.required<string>();

  /** Optional i18n key for supporting text. */
  readonly descriptionKey = input<string>();

  /** Optional i18n key for the primary action label. */
  readonly actionLabelKey = input<string>();

  readonly action = output<void>();

  constructor(protected readonly i18n: TranslationService) {}

  protected containerClass(): string {
    if (this.tone() === 'empty') {
      return 'rounded-xl border border-dashed border-slate-200 bg-white px-5 py-12 text-center shadow-sm';
    }
    return [
      'flex flex-col gap-3 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between',
      'border-red-200 bg-red-50',
    ].join(' ');
  }

  protected titleClass(): string {
    return this.tone() === 'empty' ? 'text-base font-semibold text-slate-900' : 'text-sm font-semibold text-red-900';
  }

  protected descriptionClass(): string {
    return this.tone() === 'empty' ? 'mt-2 text-sm text-slate-600' : 'mt-1 text-sm text-red-800';
  }
}
