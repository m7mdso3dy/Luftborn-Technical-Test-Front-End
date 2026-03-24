import { Component, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { type AppLocale, TranslatePipe, TranslationService } from '../i18n';
import {
  TaskFormCoordinatorService,
  TaskFormDialogComponent,
  TaskStoreService,
} from '@shared';
import { type Task } from '@shared/models/task.types';

export type DashboardSideNavIcon =
  | 'dashboard'
  | 'tasks'
  | 'calendar'
  | 'analytics'
  | 'team'
  | 'settings';

export interface DashboardSideNavItem {
  labelKey: string;
  route: string;
  icon: DashboardSideNavIcon;
  exact?: boolean;
}

@Component({
  selector: 'dashboard-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, TaskFormDialogComponent],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
  host: {
    class: 'block min-h-screen',
  },
})
export class DashboardLayoutComponent {
  protected readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly taskForm = inject(TaskFormCoordinatorService);
  private readonly taskStore = inject(TaskStoreService);

  readonly userInitials = input<string>('JD');

  readonly newTask = output<void>();

  readonly sideNavItems: readonly DashboardSideNavItem[] = [
    { labelKey: 'sidebar.dashboard', route: '/dashboard', icon: 'dashboard', exact: true },
    { labelKey: 'sidebar.tasks', route: '/dashboard/tasks', icon: 'tasks' },
    { labelKey: 'sidebar.calendar', route: '/dashboard/calendar', icon: 'calendar' },
    { labelKey: 'sidebar.analytics', route: '/dashboard/analytics', icon: 'analytics' },
    { labelKey: 'sidebar.team', route: '/dashboard/team', icon: 'team' },
    { labelKey: 'sidebar.settings', route: '/dashboard/settings', icon: 'settings' },
  ];

  protected pickLang(locale: AppLocale): void {
    void this.i18n.setLocale(locale);
  }

  protected langBtnClass(locale: AppLocale): string {
    const active = this.i18n.locale() === locale;
    return [
      'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors min-w-[2.75rem]',
      active
        ? 'bg-[#007bff] text-white shadow-sm'
        : 'text-slate-600 hover:bg-white hover:text-slate-900',
    ].join(' ');
  }

  protected onNewTask(): void {
    this.taskForm.openCreate();
    this.newTask.emit();
  }

  protected onTaskFormSaved(task: Task): void {
    this.taskStore.upsert(task);
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
