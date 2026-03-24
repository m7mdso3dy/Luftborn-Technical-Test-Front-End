import { Component, inject, input, output } from '@angular/core';
import { TranslatePipe, TranslationService } from '@core';
import { type Task, type TaskPriority } from '../../models/task.types';
import { initialsFromDisplayName } from '../../utils/name-initials';

/** Emitted when the ⋮ menu button is activated (for anchoring a popup menu). */
export interface TaskCardMenuToggle {
  task: Task;
  originalEvent: Event;
}

@Component({
  selector: 'task-card',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCardComponent {
  protected readonly i18n = inject(TranslationService);

  readonly task = input.required<Task>();

  /** When true, hides task-only UI (priority, due date, menu) for team-member style lists. */
  readonly teamLayout = input(false);

  /** When false, hides the ⋮ menu (e.g. read-only contexts). */
  readonly showMenu = input(true);

  readonly menuToggle = output<TaskCardMenuToggle>();
  /** Emitted when the card surface is activated (edit flow). */
  readonly cardClick = output<Task>();

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
    return initialsFromDisplayName(this.task().assignee.name);
  }

  get assigneeHandle(): string {
    return '@' + this.task().assignee.name.replace(/\s+/g, '');
  }

  /** Avatar suitable for `<img src>` (http(s) or data URL). */
  get assigneePhotoSrc(): string | null {
    const a = this.task().assignee.avatar?.trim();
    if (!a) return null;
    if (/^https?:\/\//i.test(a) || a.startsWith('data:')) return a;
    return null;
  }

  onMenuButtonClick(event: Event): void {
    event.stopPropagation();
    this.menuToggle.emit({ task: this.task(), originalEvent: event });
  }

  handleCardActivate(): void {
    if (this.teamLayout()) return;
    this.cardClick.emit(this.task());
  }

  onCardSpace(event: Event): void {
    if (this.teamLayout()) return;
    event.preventDefault();
    this.cardClick.emit(this.task());
  }
}
