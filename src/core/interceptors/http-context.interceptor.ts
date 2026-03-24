import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';

/**
 * Core HTTP interceptor: request id, optional Bearer token when authenticated.
 */
export const httpContextInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const headers: Record<string, string> = {
    'X-Request-Id': globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return next(req.clone({ setHeaders: headers }));
};
