import { type TaskStatus } from '../../models/task.types';

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function computeDueDisplay(
  dueAtIso: string | undefined,
  status: TaskStatus,
  completedLabel: string,
): { dueDate: string; isOverdue: boolean; overdueBy?: string } {
  if (status === 'done') {
    return { dueDate: completedLabel || 'Completed', isOverdue: false };
  }
  if (!dueAtIso) {
    return { dueDate: '—', isOverdue: false };
  }
  const due = new Date(dueAtIso);
  const today = startOfDay(new Date());
  const dueDay = startOfDay(due);
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) {
    const n = -diffDays;
    const label = `Overdue by ${n} day${n === 1 ? '' : 's'}`;
    return { dueDate: label, isOverdue: true, overdueBy: label };
  }
  if (diffDays === 0) {
    return { dueDate: 'Due today', isOverdue: false };
  }
  return { dueDate: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, isOverdue: false };
}
