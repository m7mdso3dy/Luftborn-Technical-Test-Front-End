import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { API_BASE } from '../api/api.constants';

const STORAGE_KEY = 'app.auth.token';

interface LoginResponse {
  accessToken?: string;
  tokenType?: string;
  user?: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenSignal = signal<string | null>(readStoredToken());

  /** Present when the user has a stored session token. */
  readonly token = this.tokenSignal.asReadonly();

  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  getToken(): string | null {
    return this.tokenSignal();
  }

  /** Calls `POST /api/auth/login`; persists JWT on success. */
  login(username: string, password: string): Observable<boolean> {
    const body = { username: username.trim(), password };
    return this.http.post<LoginResponse>(`${API_BASE}/auth/login`, body).pipe(
      tap((res) => {
        const t = res?.accessToken;
        if (t) {
          try {
            localStorage.setItem(STORAGE_KEY, t);
          } catch {
            /* ignore */
          }
          this.tokenSignal.set(t);
        }
      }),
      map((res) => !!res?.accessToken),
      catchError(() => of(false)),
    );
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
