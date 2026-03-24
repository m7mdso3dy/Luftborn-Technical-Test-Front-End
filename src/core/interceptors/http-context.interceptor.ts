import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Core HTTP interceptor: extend with auth headers, error mapping, or base URL logic.
 */
export const httpContextInterceptor: HttpInterceptorFn = (req, next) => {
  const withContext = req.clone({
    setHeaders: {
      'X-Request-Id': globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    },
  });
  return next(withContext);
};
