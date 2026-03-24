import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { TranslatePipe, TranslationService } from '@core';
import { TaskFormCoordinatorService, TaskStoreService } from '@shared';
import { type Task, type TaskPriority, type TaskStatus } from '@shared/models/task.types';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [TableModule, BreadcrumbModule, ButtonModule, ConfirmDialogModule, TranslatePipe],
  providers: [ConfirmationService],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPageComponent {
  protected readonly i18n = inject(TranslationService);
  private readonly taskStore = inject(TaskStoreService);
  private readonly taskForm = inject(TaskFormCoordinatorService);
  private readonly confirmation = inject(ConfirmationService);

  protected readonly tasks = this.taskStore.tasks;

  protected readonly breadcrumbItems = computed<MenuItem[]>(() => {
    void this.i18n.locale();
    return [
      { label: this.i18n.translate('tasksPage.breadcrumb.dashboard'), routerLink: '/dashboard' },
      { label: this.i18n.translate('tasksPage.breadcrumb.tasks') },
    ];
  });

  protected readonly tableMinWidth = '1400px';

  protected statusKey(status: TaskStatus): string {
    const map: Record<TaskStatus, string> = {
      todo: 'taskForm.status.todo',
      in_progress: 'taskForm.status.inProgress',
      done: 'taskForm.status.done',
    };
    return map[status];
  }

  protected priorityKey(priority: TaskPriority): string {
    const map: Record<TaskPriority, string> = {
      high: 'taskForm.priority.high',
      medium: 'taskForm.priority.medium',
      low: 'taskForm.priority.low',
    };
    return map[priority];
  }

  protected editTask(task: Task): void {
    this.taskForm.openEdit(task);
  }

  protected confirmDelete(task: Task): void {
    const template = this.i18n.translate('tasksPage.delete.message');
    const message = template.replace(/\{title\}/g, task.title);
    this.confirmation.confirm({
      header: this.i18n.translate('tasksPage.delete.header'),
      message,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.i18n.translate('tasksPage.delete.accept'),
      rejectLabel: this.i18n.translate('tasksPage.delete.reject'),
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.taskStore.remove(task.id),
    });
  }
}
