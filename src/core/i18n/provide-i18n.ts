import { provideAppInitializer, inject } from '@angular/core';
import { TranslationService } from './translation.service';

const DEFAULT_LOCALE = 'en';

export function provideI18n(defaultLocale = DEFAULT_LOCALE) {
  return provideAppInitializer(async () => {
    const i18n = inject(TranslationService);
    await i18n.load(defaultLocale);
  });
}
