import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TranslationService } from '@core';
import { SKELETON_MIN_DISPLAY_MS } from '@shared/constants/ui-timing';
import { TaskStoreService } from '@shared';
import { ShellOutletComponent } from '../../app/shell-outlet.component';
import {
  createTaskStoreMock,
  createTranslationServiceMock,
} from '../../testing/test-utils';
import { AnalyticsPageComponent } from './analytics-page.component';

describe('AnalyticsPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsPageComponent],
      providers: [
        provideRouter([{ path: '**', component: ShellOutletComponent }]),
        { provide: TranslationService, useValue: createTranslationServiceMock() },
        { provide: TaskStoreService, useValue: createTaskStoreMock() },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(AnalyticsPageComponent);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(SKELETON_MIN_DISPLAY_MS);
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});
