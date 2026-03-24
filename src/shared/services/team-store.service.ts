import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, take, tap } from 'rxjs';

import { API_BASE } from '@core/api/api.constants';
import { type Assignee } from '../models/task.types';

interface PublicUser {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class TeamStoreService {
  private readonly http = inject(HttpClient);
  private readonly _users = signal<Assignee[]>([]);

  readonly users = this._users.asReadonly();

  /** Load users from `GET /api/users`. */
  refresh(): Observable<void> {
    return this.http.get<PublicUser[]>(`${API_BASE}/users`).pipe(
      map((list) => list.map(toAssignee)),
      tap((users) => this._users.set(users)),
      map(() => void 0),
      catchError((err) => {
        console.warn('Failed to load users', err);
        this._users.set([]);
        return of(void 0);
      }),
    );
  }

  /**
   * Creates a user via `POST /api/users`.
   * New members get password `demo` and a username derived from email (same rules as the seed script).
   */
  addUser(input: { name: string; email: string; avatar: string }): Observable<Assignee> {
    const email = input.email.trim();
    const username = deriveUsername(email);
    const body = {
      name: input.name.trim(),
      email,
      username,
      password: 'demo',
      avatar: input.avatar?.trim() ?? '',
    };
    return this.http.post<PublicUser>(`${API_BASE}/users`, body).pipe(
      take(1),
      map(toAssignee),
      tap((a) => this._users.update((list) => [...list, a])),
    );
  }

  getById(id: string): Assignee | undefined {
    return this._users().find((u) => u.id === id);
  }
}

function toAssignee(u: PublicUser): Assignee {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar ?? '',
  };
}

function deriveUsername(email: string): string {
  const local = email.split('@')[0] ?? 'user';
  const base = local.replace(/[^a-z0-9._-]/gi, '') || 'user';
  return base;
}
