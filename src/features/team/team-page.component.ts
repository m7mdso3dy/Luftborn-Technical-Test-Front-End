import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  model,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, take, timer } from 'rxjs';

import { TranslatePipe, TranslationService } from '@core';
import { SKELETON_MIN_DISPLAY_MS } from '@shared/constants/ui-timing';
import { TeamStoreService, UploaderInputComponent } from '@shared';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
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
    ReactiveFormsModule,
    TranslatePipe,
    UploaderInputComponent,
    PrimeTemplate,
  ],
  templateUrl: './team-page.component.html',
  styleUrl: './team-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly i18n = inject(TranslationService);
  protected readonly teamStore = inject(TeamStoreService);

  protected readonly users = this.teamStore.users;

  /** PrimeNG [Skeleton](https://primeng.org/skeleton) until API + minimum delay finish. */
  protected readonly showSkeleton = signal(false);

  protected readonly skeletonRows = [0, 1, 2, 3, 4] as const;

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

  protected chooseAvatarLabel(): string {
    return this.i18n.translate('uploader.choose');
  }

  protected clearAvatarLabel(): string {
    return this.i18n.translate('uploader.clear');
  }
}
