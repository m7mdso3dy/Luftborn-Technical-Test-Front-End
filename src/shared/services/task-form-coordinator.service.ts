import { Injectable, signal } from '@angular/core';
import { type Task } from '../models/task.types';

/**
 * Controls the shell task modal (hosted on dashboard-layout) from anywhere in the app.
 */
@Injectable({ providedIn: 'root' })
export class TaskFormCoordinatorService {
  readonly taskFormVisible = signal(false);
  readonly editingTask = signal<Task | null>(null);

  openCreate(): void {
    this.editingTask.set(null);
    this.taskFormVisible.set(true);
  }

  openEdit(task: Task): void {
    this.editingTask.set(task);
    this.taskFormVisible.set(true);
  }
}
