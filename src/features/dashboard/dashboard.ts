import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin, timer } from 'rxjs';

import { TranslatePipe, TranslationService } from '@core';
import { SKELETON_MIN_DISPLAY_MS } from '@shared/constants/ui-timing';
import {
  StatisticCardComponent,
  TaskCardComponent,
  TaskFormCoordinatorService,
  TaskStoreService,
} from '@shared';
import { type Statistic, type Task, type TaskStatus } from '@shared/models/task.types';
import { SkeletonModule } from 'primeng/skeleton';

type FilterTab = 'all' | TaskStatus;
type SortOption = 'priority' | 'dueDate' | 'title';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatisticCardComponent, TaskCardComponent, SkeletonModule, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  protected readonly i18n = inject(TranslationService);
  private readonly taskStore = inject(TaskStoreService);
  private readonly taskForm = inject(TaskFormCoordinatorService);

  /** PrimeNG Skeleton for stats + Kanban until API + minimum delay finish. */
  protected readonly showSkeleton = signal(true);

  protected readonly statSkeletonSlots = [0, 1, 2, 3] as const;
  protected readonly kanbanSkeletonCols = [0, 1, 2] as const;
  protected readonly taskSkeletonSlots = [0, 1, 2] as const;

  ngOnInit(): void {
    forkJoin({
      data: this.taskStore.refresh(),
      minDelay: timer(SKELETON_MIN_DISPLAY_MS),
    }).subscribe({
      complete: () => this.showSkeleton.set(false),
    });
  }

  protected readonly statistics = computed<Statistic[]>(() => {
    const tasks = this.taskStore.tasks();
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'done').length;
    const inProg = tasks.filter((t) => t.status === 'in_progress').length;
    const overdue = tasks.filter((t) => t.isOverdue).length;
    return [
      {
        id: '1',
        title: 'Total Tasks',
        icon: 'tasks',
        value: total,
        change: '+12',
        changeLabel: 'this week',
        changeType: 'positive',
        color: 'blue',
      },
      {
        id: '2',
        title: 'Completed',
        icon: 'completed',
        value: completed,
        change: '+8',
        changeLabel: 'today',
        changeType: 'positive',
        color: 'green',
      },
      {
        id: '3',
        title: 'In Progress',
        icon: 'in_progress',
        value: inProg,
        change: '',
        changeLabel: 'Same as yesterday',
        changeType: 'neutral',
        color: 'orange',
      },
      {
        id: '4',
        title: 'Overdue',
        icon: 'overdue',
        value: overdue,
        change: '+3',
        changeLabel: 'today',
        changeType: 'negative',
        color: 'red',
      },
    ];
  });

  protected readonly activeFilter = signal<FilterTab>('all');
  protected readonly activeSort = signal<SortOption>('priority');
  protected readonly sortOpen = signal(false);

  protected readonly filterTabs: Array<{ key: FilterTab; labelKey: string }> = [
    { key: 'all', labelKey: 'dashboard.filter.all' },
    { key: 'todo', labelKey: 'dashboard.filter.todo' },
    { key: 'in_progress', labelKey: 'dashboard.filter.inProgress' },
    { key: 'done', labelKey: 'dashboard.filter.done' },
  ];

  protected readonly sortOptions: Array<{ key: SortOption; labelKey: string }> = [
    { key: 'priority', labelKey: 'dashboard.sort.priority' },
    { key: 'dueDate', labelKey: 'dashboard.sort.dueDate' },
    { key: 'title', labelKey: 'dashboard.sort.title' },
  ];

  protected readonly filteredTasks = computed<Task[]>(() => {
    const filter = this.activeFilter();
    const tasks = this.taskStore.tasks();
    return filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  });

  protected readonly todoTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === 'todo'),
  );
  protected readonly progressTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === 'in_progress'),
  );
  protected readonly doneTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === 'done'),
  );

  protected readonly columns = computed(() => [
    {
      key: 'todo' as const,
      titleKey: 'dashboard.column.todo',
      count: this.todoTasks().length,
      tasks: this.todoTasks(),
      dotColor: 'bg-slate-400',
    },
    {
      key: 'in_progress' as const,
      titleKey: 'dashboard.column.inProgress',
      count: this.progressTasks().length,
      tasks: this.progressTasks(),
      dotColor: 'bg-blue-500',
    },
    {
      key: 'done' as const,
      titleKey: 'dashboard.column.done',
      count: this.doneTasks().length,
      tasks: this.doneTasks(),
      dotColor: 'bg-emerald-500',
    },
  ]);

  openCreateTask(): void {
    this.taskForm.openCreate();
  }

  openEditTask(task: Task): void {
    this.taskForm.openEdit(task);
  }

  setFilter(filter: FilterTab): void {
    this.activeFilter.set(filter);
  }

  setSort(sort: SortOption): void {
    this.activeSort.set(sort);
    this.sortOpen.set(false);
  }

  toggleSort(): void {
    this.sortOpen.update((v) => !v);
  }
}
