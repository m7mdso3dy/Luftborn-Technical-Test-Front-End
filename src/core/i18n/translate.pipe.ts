import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from './translation.service';

/**
 * Pass `i18n.locale()` as the second argument so the pipe updates when the locale changes.
 * Example: {{ 'app.title' | tr: i18n.locale() }}
 */
@Pipe({
  name: 'tr',
  standalone: true,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: string, localeMark: string): string {
    void localeMark;
    return this.i18n.translate(key);
  }
}
