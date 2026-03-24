import { Injectable, computed, signal } from '@angular/core';

const STORAGE_KEY = 'app.auth.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(readStoredToken());

  /** Present when the user has a stored session token. */
  readonly token = this.tokenSignal.asReadonly();

  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  /** Returns the raw token for guards, interceptors, or API calls. */
  getToken(): string | null {
    return this.tokenSignal();
  }

  /**
   * Demo login: any non-empty username and password issues a token.
   * Replace with a real API call in production.
   */
  login(username: string, password: string): boolean {
    const u = username.trim();
    if (!u.length || !password.length) {
      return false;
    }
    const token = encodeDemoToken(u);
    try {
      localStorage.setItem(STORAGE_KEY, token);
    } catch {
      /* private mode / quota */
    }
    this.tokenSignal.set(token);
    return true;
  }

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    this.tokenSignal.set(null);
  }
}

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Opaque demo token (not a real JWT). */
function encodeDemoToken(username: string): string {
  const payload = JSON.stringify({ sub: username, ts: Date.now() });
  return typeof btoa === 'function' ? btoa(payload) : payload;
}
