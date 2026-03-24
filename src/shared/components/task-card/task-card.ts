import { Component, input, output } from '@angular/core';
import { type Task, type TaskPriority } from '../../models/task.types';

@Component({
  selector: 'task-card',
  standalone: true,
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCardComponent {
  readonly task = input.required<Task>();

  readonly menuClick = output<Task>();

  priorityBadge(priority: TaskPriority): { label: string; classes: string; barClass: string } {
    const map: Record<TaskPriority, { label: string; classes: string; barClass: string }> = {
      high:   { label: 'HIGH',   classes: 'bg-red-50 text-red-600',      barClass: 'bg-red-400' },
      medium: { label: 'MEDIUM', classes: 'bg-orange-50 text-orange-600', barClass: 'bg-orange-400' },
      low:    { label: 'LOW',    classes: 'bg-emerald-50 text-emerald-600', barClass: 'bg-emerald-400' },
    };
    return map[priority];
  }

  get isHighPriority(): boolean {
    return this.task().priority === 'high';
  }

  get initials(): string {
    return this.task()
      .assignee.name.split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  get assigneeHandle(): string {
    return '@' + this.task().assignee.name.replace(/\s+/g, '');
  }

  onMenuClick(event: Event): void {
    event.stopPropagation();
    this.menuClick.emit(this.task());
  }
}
