import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { take } from 'rxjs';
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
  protected readonly loading = signal(false);

  protected submit(): void {
    this.submitError.set(false);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const { username, password } = this.form.getRawValue();
    this.loading.set(true);
    this.auth
      .login(username, password)
      .pipe(take(1))
      .subscribe({
        next: (ok) => {
          this.loading.set(false);
          if (!ok) {
            this.submitError.set(true);
            return;
          }
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const target = safeInternalPath(returnUrl);
          void this.router.navigateByUrl(target);
        },
        error: () => {
          this.loading.set(false);
          this.submitError.set(true);
        },
      });
  }
}

function safeInternalPath(url: string | null): string {
  if (!url || !url.startsWith('/') || url.startsWith('//')) {
    return '/dashboard';
  }
  return url;
}
