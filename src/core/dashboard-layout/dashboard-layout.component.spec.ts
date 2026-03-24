import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TranslationService } from '../i18n';
import { AuthService } from '../auth/auth.service';
import { ShellOutletComponent } from '../../app/shell-outlet.component';
import {
  createAuthServiceMock,
  createTaskStoreMock,
  createTeamStoreMock,
  createTranslationServiceMock,
} from '../../testing/test-utils';
import { TaskFormCoordinatorService, TaskStoreService, TeamStoreService } from '@shared';
import { DashboardLayoutComponent } from './dashboard-layout';

describe('DashboardLayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardLayoutComponent],
      providers: [
        provideRouter([
          { path: 'dashboard/search', component: ShellOutletComponent },
          { path: '**', component: ShellOutletComponent },
        ]),
        { provide: TranslationService, useValue: createTranslationServiceMock() },
        { provide: AuthService, useValue: createAuthServiceMock() },
        { provide: TaskStoreService, useValue: createTaskStoreMock() },
        { provide: TeamStoreService, useValue: createTeamStoreMock() },
        TaskFormCoordinatorService,
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardLayoutComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
