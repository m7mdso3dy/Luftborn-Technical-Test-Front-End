import { Injectable, signal } from '@angular/core';

import { INITIAL_ASSIGNEES } from '../data/initial-assignees';
import { type Assignee } from '../models/task.types';

@Injectable({ providedIn: 'root' })
export class TeamStoreService {
  private readonly _users = signal<Assignee[]>([...INITIAL_ASSIGNEES]);

  /** Team members; task assignee picker and team page read from here. */
  readonly users = this._users.asReadonly();

  add(user: Assignee): void {
    this._users.update((list) => [...list, user]);
  }

  getById(id: string): Assignee | undefined {
    return this._users().find((u) => u.id === id);
  }
}
