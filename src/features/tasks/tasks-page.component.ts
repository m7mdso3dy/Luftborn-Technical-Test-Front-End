import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin, timer } from 'rxjs';

import { TranslatePipe, TranslationService } from '@core';
import { SKELETON_MIN_DISPLAY_MS } from '@shared/constants/ui-timing';
import { TaskFormCoordinatorService, TaskStoreService } from '@shared';
import { type Task, type TaskPriority, type TaskStatus } from '@shared/models/task.types';
import { ConfirmationService, MenuItem, PrimeTemplate } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-tasks-page',
  standalone: true,
  imports: [
    TableModule,
    BreadcrumbModule,
    ButtonModule,
    ConfirmDialogModule,
    SkeletonModule,
    TranslatePipe,
    PrimeTemplate,
  ],
  providers: [ConfirmationService],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPageComponent implements OnInit {
  protected readonly i18n = inject(TranslationService);
  protected readonly taskStore = inject(TaskStoreService);
  private readonly taskForm = inject(TaskFormCoordinatorService);
  private readonly confirmation = inject(ConfirmationService);

  protected readonly tasks = this.taskStore.tasks;

  /** PrimeNG [Skeleton](https://primeng.org/skeleton) table until API + minimum delay finish. */
  protected readonly showSkeleton = signal(false);

  protected readonly skeletonRows = [0, 1, 2, 3, 4] as const;

  ngOnInit(): void {
    this.reloadTasks();
  }

  /** Fetches tasks and keeps skeleton visible at least `SKELETON_MIN_DISPLAY_MS`. */
  protected reloadTasks(): void {
    this.showSkeleton.set(true);
    forkJoin({
      data: this.taskStore.refresh(),
      minDelay: timer(SKELETON_MIN_DISPLAY_MS),
    }).subscribe({
      complete: () => this.showSkeleton.set(false),
    });
  }

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
