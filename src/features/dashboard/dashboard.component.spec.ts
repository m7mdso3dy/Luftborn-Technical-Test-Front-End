import { TestBed } from '@angular/core/testing';

import { TranslationService } from '@core';
import { SKELETON_MIN_DISPLAY_MS } from '@shared/constants/ui-timing';
import { TaskFormCoordinatorService, TaskStoreService } from '@shared';
import { createTaskStoreMock, createTranslationServiceMock } from '../../testing/test-utils';
import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: TranslationService, useValue: createTranslationServiceMock() },
        { provide: TaskStoreService, useValue: createTaskStoreMock() },
        TaskFormCoordinatorService,
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(SKELETON_MIN_DISPLAY_MS);
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});
