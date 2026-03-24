import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpContextInterceptor } from './interceptors';
import { provideI18n } from './i18n';

export function provideCore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideHttpClient(withInterceptors([httpContextInterceptor])),
    provideI18n(),
  ]);
}
