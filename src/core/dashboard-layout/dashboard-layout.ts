import { Component, inject, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { type AppLocale, TranslatePipe, TranslationService } from '../i18n';
import {
  DASHBOARD_SIDE_NAV_ITEMS,
  type DashboardSideNavIcon,
  type DashboardSideNavItem,
} from './dashboard-nav.config';
import {
  TaskFormCoordinatorService,
  TaskFormDialogComponent,
  TaskStoreService,
  TeamStoreService,
} from '@shared';
import { type Task } from '@shared/models/task.types';

export type { DashboardSideNavIcon, DashboardSideNavItem } from './dashboard-nav.config';

@Component({
  selector: 'dashboard-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, TranslatePipe, TaskFormDialogComponent],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
  host: {
    class: 'block min-h-screen',
  },
})
export class DashboardLayoutComponent implements OnInit {
  protected readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  protected readonly taskForm = inject(TaskFormCoordinatorService);
  private readonly taskStore = inject(TaskStoreService);
  private readonly teamStore = inject(TeamStoreService);

  /** Header search field; synced from `?q=` when on `/dashboard/search`. */
  protected readonly searchDraft = signal('');

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.syncSearchFromUrl());
  }

  ngOnInit(): void {
    this.teamStore.refresh().subscribe();
    this.syncSearchFromUrl();
  }

  protected syncSearchFromUrl(): void {
    const path = this.router.url.split('?')[0];
    if (!path.includes('/dashboard/search')) {
      return;
    }
    const raw = this.router.parseUrl(this.router.url).queryParams['q'];
    const q = typeof raw === 'string' ? raw : Array.isArray(raw) ? (raw[0] ?? '') : '';
    this.searchDraft.set(q);
  }

  protected onSearchInput(ev: Event): void {
    const el = ev.target as HTMLInputElement;
    this.searchDraft.set(el.value);
  }

  protected submitSearch(): void {
    const q = this.searchDraft().trim();
    void this.router.navigate(['/dashboard/search'], { queryParams: q.length ? { q } : {} });
  }

  /** Derived from the logged-in profile (or JWT) in `AuthService`. */
  protected readonly userInitials = this.auth.displayInitials;

  readonly newTask = output<void>();

  readonly sideNavItems = DASHBOARD_SIDE_NAV_ITEMS;

  protected pickLang(locale: AppLocale): void {
    void this.i18n.setLocale(locale);
  }

  protected toggleLang(): void {
    void this.i18n.toggleLocale();
  }

  /** Bottom bar: compact language indicator. */
  protected langShortLabel(): string {
    return this.i18n.locale() === 'ar' ? 'ع' : 'EN';
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
