import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TranslationService } from '@core';
import { SKELETON_MIN_DISPLAY_MS } from '@shared/constants/ui-timing';
import { TaskFormCoordinatorService, TaskStoreService } from '@shared';
import {
  createTaskStoreMock,
  createTranslationServiceMock,
} from '../../testing/test-utils';
import { ShellOutletComponent } from '../../app/shell-outlet.component';
import { TaskSearchPageComponent } from './task-search-page.component';

describe('TaskSearchPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskSearchPageComponent],
      providers: [
        provideRouter([{ path: '**', component: ShellOutletComponent }]),
        { provide: TranslationService, useValue: createTranslationServiceMock() },
        { provide: TaskStoreService, useValue: createTaskStoreMock() },
        TaskFormCoordinatorService,
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(TaskSearchPageComponent);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(SKELETON_MIN_DISPLAY_MS);
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});
