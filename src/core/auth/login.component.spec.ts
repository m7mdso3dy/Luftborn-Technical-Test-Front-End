import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { TranslationService } from '../i18n';
import { AuthService } from './auth.service';
import { LoginComponent } from './login.component';
import { createTranslationServiceMock } from '../../testing/test-utils';
import { ShellOutletComponent } from '../../app/shell-outlet.component';

describe('LoginComponent', () => {
  let auth: { login: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    auth = { login: vi.fn(() => of(true)) };
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([{ path: '**', component: ShellOutletComponent }]),
        { provide: AuthService, useValue: auth },
        { provide: TranslationService, useValue: createTranslationServiceMock() },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should call auth.login on valid submit', async () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();

    fixture.componentInstance['form'].patchValue({
      username: 'user',
      password: 'secret',
    });
    fixture.componentInstance['submit']();
    await fixture.whenStable();

    expect(auth.login).toHaveBeenCalledWith('user', 'secret');
    expect(navSpy).toHaveBeenCalled();
  });

  it('should set submitError when login returns false', async () => {
    auth.login.mockReturnValue(of(false));
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    fixture.componentInstance['form'].patchValue({ username: 'u', password: 'p' });
    fixture.componentInstance['submit']();
    await fixture.whenStable();
    expect(fixture.componentInstance['submitError']()).toBe(true);
    expect(fixture.componentInstance['loading']()).toBe(false);
  });

  it('should set submitError when login errors', async () => {
    auth.login.mockReturnValue(throwError(() => new Error('network')));
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    fixture.componentInstance['form'].patchValue({ username: 'u', password: 'p' });
    fixture.componentInstance['submit']();
    await fixture.whenStable();
    expect(fixture.componentInstance['submitError']()).toBe(true);
    expect(fixture.componentInstance['loading']()).toBe(false);
  });
});
