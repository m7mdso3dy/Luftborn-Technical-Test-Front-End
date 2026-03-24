import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, take, tap } from 'rxjs';

import { API_BASE } from '@core/api/api.constants';
import {
  type ApiTaskRow,
  normalizeTaskFromApi,
  taskToApiPayload,
} from '../utils/task-api.mapper';
import { type Task } from '../models/task.types';

interface TasksApiResponse {
  tasks?: unknown[];
}

@Injectable({ providedIn: 'root' })
export class TaskStoreService {
  private readonly http = inject(HttpClient);
  private readonly _tasks = signal<Task[]>([]);

  readonly tasks = this._tasks.asReadonly();

  /** True while `GET /api/tasks` is in flight. */
  readonly tasksLoading = signal(false);

  /** Set when the last tasks list request failed. */
  readonly tasksLoadError = signal(false);

  /** Load tasks from `GET /api/tasks`. */
  refresh(): Observable<void> {
    this.tasksLoading.set(true);
    this.tasksLoadError.set(false);
    return this.http.get<TasksApiResponse>(`${API_BASE}/tasks`).pipe(
      map((res) =>
        (res.tasks ?? []).map((row) => normalizeTaskFromApi(row as ApiTaskRow)),
      ),
      tap((tasks) => {
        this._tasks.set(tasks);
        this.tasksLoadError.set(false);
      }),
      map(() => void 0),
      catchError((err) => {
        console.warn('Failed to load tasks', err);
        this.tasksLoadError.set(true);
        this._tasks.set([]);
        return of(void 0);
      }),
      finalize(() => this.tasksLoading.set(false)),
    );
  }

  upsert(task: Task): void {
    const exists = this._tasks().some((t) => t.id === task.id);
    const payload = taskToApiPayload(task);
    const url = `${API_BASE}/tasks/${encodeURIComponent(task.id)}`;
    const req$ = exists
      ? this.http.put<unknown>(url, payload)
      : this.http.post<unknown>(`${API_BASE}/tasks`, payload);

    req$.pipe(take(1)).subscribe({
      next: (saved) => {
        const norm = normalizeTaskFromApi(saved as ApiTaskRow);
        this._tasks.update((list) => {
          const i = list.findIndex((t) => t.id === norm.id);
          if (i === -1) {
            return [...list, norm];
          }
          const next = [...list];
          next[i] = norm;
          return next;
        });
      },
      error: (err) => console.warn('Failed to save task', err),
    });
  }

  remove(id: string): void {
    this.http
      .delete(`${API_BASE}/tasks/${encodeURIComponent(id)}`)
      .pipe(take(1))
      .subscribe({
        next: () => this._tasks.update((list) => list.filter((t) => t.id !== id)),
        error: (err) => console.warn('Failed to delete task', err),
      });
  }
}
