import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { provideCore } from '@core';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideCore(),
    provideAnimationsAsync(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none',
        },
      },
    })
  ]
};
