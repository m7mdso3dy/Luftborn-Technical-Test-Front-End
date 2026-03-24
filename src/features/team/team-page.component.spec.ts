import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TranslationService } from '@core';
import { SKELETON_MIN_DISPLAY_MS } from '@shared/constants/ui-timing';
import { TeamStoreService } from '@shared';
import { ShellOutletComponent } from '../../app/shell-outlet.component';
import {
  createTeamStoreMock,
  createTranslationServiceMock,
} from '../../testing/test-utils';
import { TeamPageComponent } from './team-page.component';

describe('TeamPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamPageComponent],
      providers: [
        provideRouter([{ path: '**', component: ShellOutletComponent }]),
        { provide: TranslationService, useValue: createTranslationServiceMock() },
        { provide: TeamStoreService, useValue: createTeamStoreMock() },
      ],
    }).compileComponents();
  });

  it('should create', async () => {
    vi.useFakeTimers();
    try {
      const fixture = TestBed.createComponent(TeamPageComponent);
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(SKELETON_MIN_DISPLAY_MS);
      fixture.detectChanges();
      expect(fixture.componentInstance).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});
