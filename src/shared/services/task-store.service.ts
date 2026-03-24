import { Injectable, signal } from '@angular/core';
import { type Task } from '../models/task.types';

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Prepare Q4 budget report',
    description: 'Compile and analyze financial data for quarterly budget presentation',
    status: 'todo',
    priority: 'high',
    dueAt: '2026-03-22',
    dueDate: 'Overdue by 2 days',
    isOverdue: true,
    overdueBy: 'Overdue by 2 days',
    completedAt: '',
    assignee: { id: 'a1', name: 'Sarah', avatar: '', email: 'sarah@example.com' },
    tags: ['Finance'],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 't2',
    title: 'Design new homepage layout',
    description: 'Create wireframes and mockups for the new homepage redesign with modern UI elements',
    status: 'todo',
    priority: 'high',
    dueAt: '2026-03-26',
    dueDate: 'Due in 2 days',
    isOverdue: false,
    completedAt: '',
    assignee: { id: 'a2', name: 'John', avatar: '', email: 'john@example.com' },
    tags: ['Design'],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 't3',
    title: 'Update documentation',
    description: 'Review and update API documentation for v2.0 release',
    status: 'todo',
    priority: 'medium',
    dueAt: '2026-03-29',
    dueDate: 'Due in 5 days',
    isOverdue: false,
    completedAt: '',
    assignee: { id: 'a1', name: 'Sarah', avatar: '', email: 'sarah@example.com' },
    tags: ['Documentation'],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 't4',
    title: 'Organize team meeting',
    description: 'Schedule and prepare agenda for quarterly planning session',
    status: 'todo',
    priority: 'low',
    dueAt: '2026-03-31',
    dueDate: 'Due in 1 week',
    isOverdue: false,
    completedAt: '',
    assignee: { id: 'a3', name: 'Mike', avatar: '', email: 'mike@example.com' },
    tags: ['Admin'],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 't5',
    title: 'Update payment gateway integration',
    description: 'Migrate to new payment provider API and update billing logic',
    status: 'in_progress',
    priority: 'high',
    dueAt: '2026-03-23',
    dueDate: 'Overdue by 1 day',
    isOverdue: true,
    overdueBy: 'Overdue by 1 day',
    completedAt: '',
    assignee: { id: 'a2', name: 'John', avatar: '', email: 'john@example.com' },
    tags: ['Backend'],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 't6',
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication system with refresh tokens',
    status: 'in_progress',
    priority: 'high',
    dueAt: '2026-03-27',
    dueDate: 'Due in 3 days',
    isOverdue: false,
    completedAt: '',
    assignee: { id: 'a2', name: 'John', avatar: '', email: 'john@example.com' },
    tags: ['Backend'],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 't7',
    title: 'Optimize database queries',
    description: 'Review and optimize slow queries identified in performance audit',
    status: 'in_progress',
    priority: 'medium',
    dueAt: '2026-03-28',
    dueDate: 'Due in 4 days',
    isOverdue: false,
    completedAt: '',
    assignee: { id: 'a1', name: 'Sarah', avatar: '', email: 'sarah@example.com' },
    tags: ['Performance'],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 't8',
    title: 'Fix critical login bug',
    description: 'Resolved issue preventing users from logging in on mobile devices',
    status: 'done',
    priority: 'high',
    dueDate: 'Completed today',
    isOverdue: false,
    completedAt: 'Completed today',
    assignee: { id: 'a3', name: 'Mike', avatar: '', email: 'mike@example.com' },
    tags: ['Bug Fix'],
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 't9',
    title: 'Setup CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment',
    status: 'done',
    priority: 'medium',
    dueDate: 'Completed yesterday',
    isOverdue: false,
    completedAt: 'Completed yesterday',
    assignee: { id: 'a2', name: 'John', avatar: '', email: 'john@example.com' },
    tags: ['DevOps'],
    createdAt: '',
    updatedAt: '',
  },
];

@Injectable({ providedIn: 'root' })
export class TaskStoreService {
  private readonly _tasks = signal<Task[]>([...INITIAL_TASKS]);

  /** All tasks; dashboard and other views read from here. */
  readonly tasks = this._tasks.asReadonly();

  upsert(task: Task): void {
    this._tasks.update((list) => {
      const i = list.findIndex((t) => t.id === task.id);
      if (i === -1) {
        return [...list, task];
      }
      const next = [...list];
      next[i] = task;
      return next;
    });
  }

  remove(id: string): void {
    this._tasks.update((list) => list.filter((t) => t.id !== id));
  }
}
