import { computeDueDisplay } from '../components/task-form-dialog/task-due.helpers';
import {
  type Assignee,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '../models/task.types';

export interface ApiTaskRow {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt?: string;
  dueDate?: string;
  isOverdue?: boolean;
  overdueBy?: string;
  completedAt?: string;
  assignee: Assignee;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

function dueAtToDateOnly(v: string | undefined): string | undefined {
  if (!v) return undefined;
  if (v.length <= 10) return v;
  return v.split('T')[0];
}

function completedLabel(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

/** Maps API task JSON to the `Task` shape used by the UI (including friendly due strings). */
export function normalizeTaskFromApi(row: ApiTaskRow): Task {
  const status = row.status;
  const dueAtRaw = row.dueAt || row.dueDate;
  const dueAt = dueAtToDateOnly(dueAtRaw);
  const completedRaw = row.completedAt ?? '';
  const completedAt = completedRaw;
  const { dueDate, isOverdue, overdueBy } = computeDueDisplay(
    dueAt,
    status,
    status === 'done' ? completedLabel(completedAt) : '',
  );
  const a = row.assignee;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    status,
    priority: row.priority,
    dueAt,
    dueDate,
    isOverdue: row.isOverdue ?? isOverdue,
    overdueBy: row.overdueBy ?? overdueBy,
    completedAt,
    assignee: {
      id: a?.id ?? 'unknown',
      name: a?.name ?? '',
      email: a?.email ?? '',
      avatar: a?.avatar ?? '',
    },
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.createdAt ?? '',
    updatedAt: row.updatedAt ?? '',
  };
}

/** Strip UI-only fields if needed; server accepts full task objects on PUT. */
export function taskToApiPayload(task: Task): Record<string, unknown> {
  return { ...task };
}
