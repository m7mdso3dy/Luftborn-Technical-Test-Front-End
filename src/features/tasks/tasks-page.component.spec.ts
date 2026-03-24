import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TranslationService } from '@core';
import { SKELETON_MIN_DISPLAY_MS } from '@shared/constants/ui-timing';
import { TaskFormCoordinatorService, TaskStoreService, TeamStoreService } from '@shared';
import { ConfirmationService } from 'primeng/api';
import { ShellOutletComponent } from '../../app/shell-outlet.component';
import {
  createTaskStoreMock,
  createTeamStoreMock,
  createTranslationServiceMock,
} from '../../testing/test-utils';
import { TasksPageComponent } from './tasks-page.component';

describe('TasksPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksPageComponent],
      providers: [
        provideRouter([{ path: '**', component: ShellOutletComponent }]),
        ConfirmationService,
        { provide: TranslationService, useValue: createTranslationServiceMock() },
        { provide: TaskStoreService, useValue: createTaskStoreMock() },
        { provide: TeamStoreService, useValue: createTeamStoreMock() },
        TaskFormCoordinatorService,
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(TasksPageComponent);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(SKELETON_MIN_DISPLAY_MS);
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});
