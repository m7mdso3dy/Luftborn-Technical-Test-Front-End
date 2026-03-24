import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  model,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TranslatePipe, TranslationService } from '@core';
import { TeamStoreService, UploaderInputComponent } from '@shared';
import { type Assignee } from '@shared/models/task.types';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
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
    ReactiveFormsModule,
    TranslatePipe,
    UploaderInputComponent,
    PrimeTemplate,
  ],
  templateUrl: './team-page.component.html',
  styleUrl: './team-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPageComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly i18n = inject(TranslationService);
  private readonly teamStore = inject(TeamStoreService);

  protected readonly users = this.teamStore.users;

  readonly addVisible = model(false);

  protected readonly breadcrumbItems = computed<MenuItem[]>(() => {
    void this.i18n.locale();
    return [
      { label: this.i18n.translate('teamPage.breadcrumb.dashboard'), routerLink: '/dashboard' },
      { label: this.i18n.translate('teamPage.breadcrumb.team') },
    ];
  });

  protected readonly tableMinWidth = '600px';

  readonly addForm = this.fb.group({
    name: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }),
    email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    avatar: this.fb.control('', { nonNullable: true }),
  });

  protected openAdd(): void {
    this.addForm.reset({ name: '', email: '', avatar: '' });
    this.addForm.markAsUntouched();
    this.addVisible.set(true);
  }

  protected closeAdd(): void {
    this.addVisible.set(false);
  }

  protected saveUser(): void {
    this.addForm.markAllAsTouched();
    if (this.addForm.invalid) {
      return;
    }
    const v = this.addForm.getRawValue();
    const user: Assignee = {
      id: newUserId(),
      name: v.name.trim(),
      email: v.email.trim(),
      avatar: v.avatar.trim(),
    };
    this.teamStore.add(user);
    this.addVisible.set(false);
  }

  protected chooseAvatarLabel(): string {
    return this.i18n.translate('uploader.choose');
  }

  protected clearAvatarLabel(): string {
    return this.i18n.translate('uploader.clear');
  }
}

function newUserId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `u-${Date.now()}`;
}
