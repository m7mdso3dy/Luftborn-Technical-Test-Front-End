import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService, TranslationService } from '@core';
import { TaskFormCoordinatorService } from '@shared';
import {
  createAuthServiceMock,
  createTranslationServiceMock,
} from '../../testing/test-utils';
import { ShellOutletComponent } from '../../app/shell-outlet.component';
import { MobileMorePageComponent } from './mobile-more-page.component';

describe('MobileMorePageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileMorePageComponent],
      providers: [
        provideRouter([{ path: '**', component: ShellOutletComponent }]),
        { provide: TranslationService, useValue: createTranslationServiceMock() },
        { provide: AuthService, useValue: createAuthServiceMock() },
        TaskFormCoordinatorService,
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MobileMorePageComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
