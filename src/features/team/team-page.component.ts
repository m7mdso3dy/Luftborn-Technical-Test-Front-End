import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  inject,
  model,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, take, timer } from 'rxjs';

import { TranslatePipe, TranslationService } from '@core';
import { SKELETON_MIN_DISPLAY_MS } from '@shared/constants/ui-timing';
import {
  TaskCardComponent,
  TeamStoreService,
  UploaderInputComponent,
  initialsFromDisplayName,
} from '@shared';
import { type Assignee, type Task } from '@shared/models/task.types';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-team-page',
  standalone: true,
  imports: [
    TableModule,
    BreadcrumbModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SkeletonModule,
    PaginatorModule,
    ReactiveFormsModule,
    TranslatePipe,
    UploaderInputComponent,
    PrimeTemplate,
    TaskCardComponent,
  ],
  templateUrl: './team-page.component.html',
  styleUrl: './team-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  constructor() {
    effect(() => {
      const len = this.users().length;
      const rows = this.cardPageRows;
      const first = this.cardPageFirst();
      if (len === 0) {
        if (first !== 0) this.cardPageFirst.set(0);
        return;
      }
      if (first >= len) {
        const newFirst = Math.floor((len - 1) / rows) * rows;
        if (newFirst !== first) this.cardPageFirst.set(newFirst);
      }
    });
  }

  protected readonly i18n = inject(TranslationService);
  protected readonly teamStore = inject(TeamStoreService);

  protected readonly users = this.teamStore.users;

  /** PrimeNG [Skeleton](https://primeng.org/skeleton) until API + minimum delay finish. */
  protected readonly showSkeleton = signal(false);

  protected readonly skeletonRows = [0, 1, 2, 3, 4] as const;

  /** Card grid pagination (< lg); matches desktop table page size. */
  protected readonly cardPageRows = 10;
  protected readonly cardPageFirst = signal(0);

  protected readonly cardGridUsers = computed(() => {
    const all = this.users();
    const first = this.cardPageFirst();
    return all.slice(first, first + this.cardPageRows);
  });

  readonly addVisible = model(false);

  ngOnInit(): void {
    this.reloadUsers();
  }

  protected reloadUsers(): void {
    this.showSkeleton.set(true);
    forkJoin({
      data: this.teamStore.refresh(),
      minDelay: timer(SKELETON_MIN_DISPLAY_MS),
    }).subscribe({
      complete: () => this.showSkeleton.set(false),
    });
  }

  protected readonly breadcrumbItems = computed<MenuItem[]>(() => {
    void this.i18n.locale();
    return [
      { label: this.i18n.translate('teamPage.breadcrumb.dashboard'), routerLink: '/dashboard' },
      { label: this.i18n.translate('teamPage.breadcrumb.team') },
    ];
  });

  protected readonly tableMinWidth = '600px';

  /** Maps a team member to a minimal `Task` shape for `task-card` in mobile layout. */
  protected onTeamCardPageChange(event: { first?: number }): void {
    this.cardPageFirst.set(event.first ?? 0);
  }

  protected userAsDisplayTask(u: Assignee): Task {
    return {
      id: u.id,
      title: u.name,
      description: u.email,
      status: 'done',
      priority: 'low',
      dueDate: '—',
      isOverdue: false,
      completedAt: '',
      assignee: u,
      tags: [],
      createdAt: '',
      updatedAt: '',
    };
  }

  protected readonly saveError = signal(false);

  readonly addForm = this.fb.group({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    avatar: this.fb.control('', { nonNullable: true }),
  });

  protected openAdd(): void {
    this.saveError.set(false);
    this.addForm.reset({ name: '', email: '', avatar: '' });
    this.addForm.markAsUntouched();
    this.addVisible.set(true);
  }

  protected closeAdd(): void {
    this.addVisible.set(false);
  }

  protected saveUser(): void {
    this.saveError.set(false);
    this.addForm.markAllAsTouched();
    if (this.addForm.invalid) {
      return;
    }
    const v = this.addForm.getRawValue();
    this.teamStore
      .addUser({
        name: v.name.trim(),
        email: v.email.trim(),
        avatar: v.avatar.trim(),
      })
      .pipe(take(1))
      .subscribe({
        next: () => this.addVisible.set(false),
        error: () => this.saveError.set(true),
      });
  }

  /** Up to two letters when no avatar image (shared with `task-card`). */
  protected readonly userInitials = initialsFromDisplayName;

  protected chooseAvatarLabel(): string {
    return this.i18n.translate('uploader.choose');
  }

  protected clearAvatarLabel(): string {
    return this.i18n.translate('uploader.clear');
  }
}
