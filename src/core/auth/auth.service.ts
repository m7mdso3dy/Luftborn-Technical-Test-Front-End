import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { API_BASE } from '../api/api.constants';
import { HTTP_SUPPRESS_ERROR_TOAST } from '../interceptors';

const STORAGE_KEY = 'app.auth.token';
const STORAGE_KEY_USER = 'app.auth.user';

/** Public user shape returned from `POST /api/auth/login`. */
export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  avatar?: string;
}

interface LoginResponse {
  accessToken?: string;
  tokenType?: string;
  user?: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenSignal = signal<string | null>(readStoredToken());
  private readonly userSignal = signal<AuthUser | null>(readStoredUser());

  /** Present when the user has a stored session token. */
  readonly token = this.tokenSignal.asReadonly();

  /** Profile from the last successful login (persisted for the session). */
  readonly user = this.userSignal.asReadonly();

  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  /** Two-letter (or short) initials for the header avatar. */
  readonly displayInitials = computed(() =>
    initialsForSession(this.userSignal(), this.tokenSignal()),
  );

  getToken(): string | null {
    return this.tokenSignal();
  }

  /** Calls `POST /api/auth/login`; persists JWT on success. */
  login(username: string, password: string): Observable<boolean> {
    const body = { username: username.trim(), password };
    return this.http
      .post<LoginResponse>(`${API_BASE}/auth/login`, body, {
        context: new HttpContext().set(HTTP_SUPPRESS_ERROR_TOAST, true),
      })
      .pipe(
      tap((res) => {
        const t = res?.accessToken;
        const u = res?.user;
        if (t) {
          try {
            localStorage.setItem(STORAGE_KEY, t);
          } catch {
            /* ignore */
          }
          this.tokenSignal.set(t);
          if (u?.id) {
            persistUser(u);
            this.userSignal.set(u);
          } else {
            try {
              localStorage.removeItem(STORAGE_KEY_USER);
            } catch {
              /* ignore */
            }
            this.userSignal.set(null);
          }
        }
      }),
      map((res) => !!res?.accessToken),
      catchError(() => of(false)),
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch {
      /* ignore */
    }
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }
}

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    const u = JSON.parse(raw) as AuthUser;
    return u?.id ? u : null;
  } catch {
    return null;
  }
}

function persistUser(u: AuthUser): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
  } catch {
    /* ignore */
  }
}

function decodeJwtPayload(token: string): { username?: string; email?: string } | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const p = JSON.parse(json) as Record<string, unknown>;
    return {
      username: typeof p['username'] === 'string' ? p['username'] : undefined,
      email: typeof p['email'] === 'string' ? p['email'] : undefined,
    };
  } catch {
    return null;
  }
}

function initialsFromUser(u: AuthUser): string {
  const av = u.avatar?.trim();
  if (av && !/^https?:\/\//i.test(av) && av.length <= 4) {
    return av.toUpperCase().slice(0, 3);
  }
  const name = u.name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (parts.length === 1 && parts[0].length === 1) {
      return parts[0].toUpperCase();
    }
  }
  return initialsFromLogin(u.username, u.email);
}

function initialsFromLogin(username?: string, email?: string): string {
  const un = (username || email?.split('@')[0] || '').trim();
  if (un.length >= 2) {
    return un.slice(0, 2).toUpperCase();
  }
  if (un.length === 1) {
    return un.toUpperCase();
  }
  return 'U';
}

function initialsForSession(user: AuthUser | null, token: string | null): string {
  if (user) {
    return initialsFromUser(user);
  }
  if (token) {
    const p = decodeJwtPayload(token);
    if (p) {
      return initialsFromLogin(p.username, p.email);
    }
  }
  return 'U';
}
