import { computed, signal } from '@angular/core';
import { of } from 'rxjs';

import { TranslationService } from '@core';
import { TaskStoreService, TeamStoreService, type TaskListFilters } from '@shared';
import { type Assignee, type Statistic, type Task } from '@shared/models/task.types';

/** Minimal `TranslationService` for unit tests (no HTTP). */
export function createTranslationServiceMock(): Pick<
  TranslationService,
  'locale' | 'translate' | 'isRtl' | 'load' | 'initializeFromStorage' | 'setLocale' | 'toggleLocale'
> {
  return {
    locale: signal('en'),
    translate: (key: string, fallback?: string) => fallback ?? key,
    isRtl: () => false,
    load: async () => {},
    initializeFromStorage: async () => {},
    setLocale: async () => {},
    toggleLocale: async () => {},
  };
}

export function createAssigneeFixture(overrides?: Partial<Assignee>): Assignee {
  return {
    id: 'a1',
    name: 'Alex User',
    email: 'alex@example.com',
    avatar: '',
    ...overrides,
  };
}

export function createTaskFixture(overrides?: Partial<Task>): Task {
  return {
    id: 't1',
    title: 'Sample task title',
    description: 'Sample description for the task card and forms.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-12-31',
    isOverdue: false,
    completedAt: '',
    assignee: createAssigneeFixture(),
    tags: ['tag'],
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

export function createStatisticFixture(overrides?: Partial<Statistic>): Statistic {
  return {
    id: 's1',
    title: 'Total tasks',
    icon: 'tasks',
    value: 12,
    change: '+2',
    changeLabel: 'vs last week',
    changeType: 'positive',
    color: 'blue',
    ...overrides,
  };
}

export function createTaskStoreMock(tasks: Task[] = [createTaskFixture()]): Pick<
  TaskStoreService,
  'tasks' | 'tasksLoading' | 'tasksLoadError' | 'refresh' | 'upsert' | 'remove' | 'updateTaskStatus'
> {
  const _tasks = signal<Task[]>(tasks);
  const first = () => tasks[0] ?? createTaskFixture();
  return {
    tasks: _tasks.asReadonly(),
    tasksLoading: signal(false),
    tasksLoadError: signal(false),
    refresh: (_filters?: TaskListFilters) => of(undefined),
    upsert: () => {},
    remove: () => {},
    updateTaskStatus: () => of(first()),
  };
}

export function createTeamStoreMock(users: Assignee[] = [createAssigneeFixture()]): Pick<
  TeamStoreService,
  'users' | 'refresh' | 'addUser'
> {
  return {
    users: signal(users).asReadonly(),
    refresh: () => of(undefined),
    addUser: () => of(users[0] ?? createAssigneeFixture()),
  };
}

/** Minimal `AuthService` surface used by layout / login tests. */
export function createAuthServiceMock() {
  const user = signal<{ id: string; name?: string } | null>(null);
  const token = signal<string | null>('mock-jwt');
  return {
    user: user.asReadonly(),
    token: token.asReadonly(),
    isAuthenticated: computed(() => !!token()),
    displayInitials: computed(() => 'MU'),
    login: () => of(true),
    logout: () => {
      token.set(null);
      user.set(null);
    },
    getToken: () => token(),
  };
}
