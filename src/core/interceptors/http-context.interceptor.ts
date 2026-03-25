import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { AuthService } from '../auth/auth.service';
import { TranslationService } from '../i18n';
import { HTTP_FORCE_ERROR_TOAST, HTTP_SUPPRESS_ERROR_TOAST } from './http-toast.context';

/**
 * Core HTTP interceptor: request id, optional Bearer token when authenticated.
 */
export const httpContextInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const messages = inject(MessageService);
  const i18n = inject(TranslationService);
  const token = auth.getToken();

  const headers: Record<string, string> = {
    'X-Request-Id': globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return next(req.clone({ setHeaders: headers })).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        if (req.context.get(HTTP_SUPPRESS_ERROR_TOAST)) {
          return throwError(() => err);
        }

        // Translation JSON loads should never spam global toasts.
        if (req.url.includes('/i18n/')) {
          return throwError(() => err);
        }

        const shouldToast = shouldShowHttpErrorToast(req);

        if (shouldToast) {
          const summary = i18n.translate('http.toast.errorSummary', 'Request failed');
          const detail = buildHttpErrorDetail(i18n, err);
          messages.add({
            severity: 'error',
            summary,
            detail,
            life: 5000,
          });
        }
      }
      return throwError(() => err);
    }),
  );
};

function shouldShowHttpErrorToast(req: HttpRequest<unknown>): boolean {
  if (req.context.get(HTTP_FORCE_ERROR_TOAST)) {
    return true;
  }

  // Default: surface mutating requests globally; keep GET failures page-driven unless explicitly forced.
  return req.method !== 'GET';
}

function buildHttpErrorDetail(i18n: TranslationService, err: HttpErrorResponse): string {
  if (err.status === 0) {
    return i18n.translate('http.toast.networkError', 'Network error. Check that the API is running.');
  }
  if (err.status === 401) {
    return i18n.translate('http.toast.unauthorized', 'Your session expired. Please sign in again.');
  }
  if (err.status === 403) {
    return i18n.translate('http.toast.forbidden', 'You do not have permission to perform this action.');
  }
  if (err.status === 404) {
    return i18n.translate('http.toast.notFound', 'Requested resource was not found.');
  }
  if (err.status >= 500) {
    return i18n.translate('http.toast.serverError', 'Server error. Please try again.');
  }
  const fallback = i18n.translate('http.toast.genericError', 'Something went wrong. Please try again.');
  const msg = extractHttpErrorMessage(err);
  return msg ? `${fallback} (${msg})` : fallback;
}

function extractHttpErrorMessage(err: HttpErrorResponse): string | null {
  const e = err.error as unknown;
  if (!e) return null;
  if (typeof e === 'string') return e.slice(0, 160);
  if (typeof e === 'object') {
    const maybeMessage = (e as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage.slice(0, 160);
  }
  return null;
}
