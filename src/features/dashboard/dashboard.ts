import { Component, computed, inject, signal } from '@angular/core';

import { TranslatePipe, TranslationService } from '@core';
import { StatisticCardComponent, TaskCardComponent } from '@shared';
import { type Statistic, type Task, type TaskStatus } from '@shared/models/task.types';

const STATISTICS: Statistic[] = [
  {
    id: '1',
    title: 'Total Tasks',
    icon: 'tasks',
    value: 156,
    change: '+12',
    changeLabel: 'this week',
    changeType: 'positive',
    color: 'blue',
  },
  {
    id: '2',
    title: 'Completed',
    icon: 'completed',
    value: 89,
    change: '+8',
    changeLabel: 'today',
    changeType: 'positive',
    color: 'green',
  },
  {
    id: '3',
    title: 'In Progress',
    icon: 'in_progress',
    value: 42,
    change: '',
    changeLabel: 'Same as yesterday',
    changeType: 'neutral',
    color: 'orange',
  },
  {
    id: '4',
    title: 'Overdue',
    icon: 'overdue',
    value: 25,
    change: '+3',
    changeLabel: 'today',
    changeType: 'negative',
    color: 'red',
  },
];

const TASKS: Task[] = [
  {
    id: 't1',
    title: 'Prepare Q4 budget report',
    description: 'Compile and analyze financial data for quarterly budget presentation',
    status: 'todo',
    priority: 'high',
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
    dueDate: 'Overdue by 1 day',
    isOverdue: true,
    overdueBy: 'Overdue by 1 day',
    completedAt: '',
    assignee: { id: 'a4', name: 'John', avatar: '', email: 'john@example.com' },
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
    dueDate: 'Due in 3 days',
    isOverdue: false,
    completedAt: '',
    assignee: { id: 'a4', name: 'John', avatar: '', email: 'john@example.com' },
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
    completedAt: 'today',
    assignee: { id: 'a5', name: 'Mike', avatar: '', email: 'mike@example.com' },
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
    completedAt: 'yesterday',
    assignee: { id: 'a4', name: 'John', avatar: '', email: 'john@example.com' },
    tags: ['DevOps'],
    createdAt: '',
    updatedAt: '',
  },
];

type FilterTab = 'all' | TaskStatus;
type SortOption = 'priority' | 'dueDate' | 'title';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatisticCardComponent, TaskCardComponent, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent {
  protected readonly i18n = inject(TranslationService);

  protected readonly statistics = signal<Statistic[]>(STATISTICS);

  protected readonly activeFilter = signal<FilterTab>('all');
  protected readonly activeSort = signal<SortOption>('priority');
  protected readonly sortOpen = signal(false);

  protected readonly filterTabs: Array<{ key: FilterTab; labelKey: string }> = [
    { key: 'all',         labelKey: 'dashboard.filter.all' },
    { key: 'todo',        labelKey: 'dashboard.filter.todo' },
    { key: 'in_progress', labelKey: 'dashboard.filter.inProgress' },
    { key: 'done',        labelKey: 'dashboard.filter.done' },
  ];

  protected readonly sortOptions: Array<{ key: SortOption; labelKey: string }> = [
    { key: 'priority', labelKey: 'dashboard.sort.priority' },
    { key: 'dueDate',  labelKey: 'dashboard.sort.dueDate' },
    { key: 'title',    labelKey: 'dashboard.sort.title' },
  ];

  private readonly allTasks = signal<Task[]>(TASKS);

  protected readonly filteredTasks = computed<Task[]>(() => {
    const filter = this.activeFilter();
    const tasks = filter === 'all' ? this.allTasks() : this.allTasks().filter((t) => t.status === filter);
    return tasks;
  });

  protected readonly todoTasks    = computed(() => this.filteredTasks().filter((t) => t.status === 'todo'));
  protected readonly progressTasks = computed(() => this.filteredTasks().filter((t) => t.status === 'in_progress'));
  protected readonly doneTasks    = computed(() => this.filteredTasks().filter((t) => t.status === 'done'));

  protected readonly columns = computed(() => [
    { key: 'todo' as const,        titleKey: 'dashboard.column.todo',       count: this.todoTasks().length,     tasks: this.todoTasks(),     dotColor: 'bg-slate-400' },
    { key: 'in_progress' as const, titleKey: 'dashboard.column.inProgress', count: this.progressTasks().length, tasks: this.progressTasks(), dotColor: 'bg-blue-500' },
    { key: 'done' as const,        titleKey: 'dashboard.column.done',       count: this.doneTasks().length,     tasks: this.doneTasks(),     dotColor: 'bg-emerald-500' },
  ]);

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
