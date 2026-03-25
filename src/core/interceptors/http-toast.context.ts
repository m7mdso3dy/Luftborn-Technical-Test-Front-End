import { HttpContextToken } from '@angular/common/http';

/**
 * When `true`, suppresses global HTTP error toasts for this request.
 * Useful for flows that already show contextual UI errors (e.g. login form).
 */
export const HTTP_SUPPRESS_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/**
 * When `true`, enables global HTTP error toasts for this request (including GET).
 * Default behavior is: mutating methods toast unless suppressed; GET does not toast unless forced.
 */
export const HTTP_FORCE_ERROR_TOAST = new HttpContextToken<boolean>(() => false);
