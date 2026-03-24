import { provideAppInitializer, inject } from '@angular/core';
import { TranslationService } from './translation.service';

export function provideI18n() {
  return provideAppInitializer(async () => {
    const i18n = inject(TranslationService);
    await i18n.initializeFromStorage();
  });
}
