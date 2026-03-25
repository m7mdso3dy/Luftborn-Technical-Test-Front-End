import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { forkJoin, timer } from 'rxjs';

import { TranslatePipe, TranslationService } from '@core';
import { SKELETON_MIN_DISPLAY_MS } from '@shared/constants/ui-timing';
import { ApiFeedbackComponent, TaskStoreService } from '@shared';
import { type Task, type TaskPriority, type TaskStatus } from '@shared/models/task.types';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-analytics-page',
  standalone: true,
  imports: [
    BreadcrumbModule,
    ButtonModule,
    ChartModule,
    SkeletonModule,
    TranslatePipe,
    ApiFeedbackComponent,
  ],
  templateUrl: './analytics-page.component.html',
  styleUrl: './analytics-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsPageComponent implements OnInit {
  protected readonly i18n = inject(TranslationService);
  protected readonly taskStore = inject(TaskStoreService);

  protected readonly showSkeleton = signal(true);

  protected readonly breadcrumbItems = computed<MenuItem[]>(() => {
    void this.i18n.locale();
    return [
      { label: this.i18n.translate('analyticsPage.breadcrumb.dashboard'), routerLink: '/dashboard' },
      { label: this.i18n.translate('analyticsPage.breadcrumb.analytics') },
    ];
  });

  protected readonly chartOptions = computed(() => {
    void this.i18n.locale();
    const rtl = this.i18n.isRtl();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          rtl,
          labels: { usePointStyle: true },
        },
      },
      scales: {
        x: { ticks: { maxRotation: rtl ? 0 : 45, minRotation: 0 } },
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
      },
    };
  });

  /** Doughnut / pie charts omit cartesian scales. */
  protected readonly doughnutOptions = computed(() => {
    void this.i18n.locale();
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          rtl: this.i18n.isRtl(),
          labels: { usePointStyle: true },
        },
      },
    };
  });

  protected readonly statusChartData = computed(() => {
    void this.i18n.locale();
    const tasks = this.taskStore.tasks();
    const c = countByStatus(tasks);
    return {
      labels: [
        this.i18n.translate('taskForm.status.todo'),
        this.i18n.translate('taskForm.status.inProgress'),
        this.i18n.translate('taskForm.status.done'),
      ],
      datasets: [
        {
          label: this.i18n.translate('analyticsPage.datasetLabel'),
          data: [c.todo, c.in_progress, c.done],
          backgroundColor: ['#94a3b8', '#3b82f6', '#10b981'],
          borderColor: ['#64748b', '#2563eb', '#059669'],
          borderWidth: 1,
        },
      ],
    };
  });

  protected readonly priorityChartData = computed(() => {
    void this.i18n.locale();
    const tasks = this.taskStore.tasks();
    const c = countByPriority(tasks);
    return {
      labels: [
        this.i18n.translate('taskForm.priority.high'),
        this.i18n.translate('taskForm.priority.medium'),
        this.i18n.translate('taskForm.priority.low'),
      ],
      datasets: [
        {
          label: this.i18n.translate('analyticsPage.datasetLabel'),
          data: [c.high, c.medium, c.low],
          backgroundColor: ['#ef4444', '#f59e0b', '#22c55e'],
          borderColor: ['#dc2626', '#d97706', '#16a34a'],
          borderWidth: 1,
        },
      ],
    };
  });

  protected readonly overdueChartData = computed(() => {
    void this.i18n.locale();
    const tasks = this.taskStore.tasks();
    let overdue = 0;
    let ok = 0;
    for (const t of tasks) {
      if (t.isOverdue) overdue += 1;
      else ok += 1;
    }
    return {
      labels: [
        this.i18n.translate('analyticsPage.overdue'),
        this.i18n.translate('analyticsPage.notOverdue'),
      ],
      datasets: [
        {
          label: this.i18n.translate('analyticsPage.datasetLabel'),
          data: [overdue, ok],
          backgroundColor: ['#ef4444', '#22c55e'],
          borderColor: ['#ffffff'],
          borderWidth: 2,
        },
      ],
    };
  });

  ngOnInit(): void {
    this.showSkeleton.set(true);
    forkJoin({
      data: this.taskStore.refresh(),
      minDelay: timer(SKELETON_MIN_DISPLAY_MS),
    }).subscribe({
      complete: () => this.showSkeleton.set(false),
    });
  }

  protected reload(): void {
    this.showSkeleton.set(true);
    forkJoin({
      data: this.taskStore.refresh(),
      minDelay: timer(SKELETON_MIN_DISPLAY_MS),
    }).subscribe({
      complete: () => this.showSkeleton.set(false),
    });
  }
}

function countByStatus(tasks: Task[]): Record<TaskStatus, number> {
  const out: Record<TaskStatus, number> = { todo: 0, in_progress: 0, done: 0 };
  for (const t of tasks) {
    if (t.status in out) out[t.status] += 1;
  }
  return out;
}

function countByPriority(tasks: Task[]): Record<TaskPriority, number> {
  const out: Record<TaskPriority, number> = { high: 0, medium: 0, low: 0 };
  for (const t of tasks) {
    if (t.priority in out) out[t.priority] += 1;
  }
  return out;
}
