import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslatePipe, TranslationService } from '../i18n';
import { AuthService } from './auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block min-h-screen',
  },
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(TranslationService);

  protected readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(1)]],
    password: ['', [Validators.required]],
  });

  protected readonly submitError = signal(false);

  protected submit(): void {
    this.submitError.set(false);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const { username, password } = this.form.getRawValue();
    const ok = this.auth.login(username, password);
    if (!ok) {
      this.submitError.set(true);
      return;
    }
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const target = safeInternalPath(returnUrl);
    void this.router.navigateByUrl(target);
  }
}

function safeInternalPath(url: string | null): string {
  if (!url || !url.startsWith('/') || url.startsWith('//')) {
    return '/dashboard';
  }
  return url;
}
