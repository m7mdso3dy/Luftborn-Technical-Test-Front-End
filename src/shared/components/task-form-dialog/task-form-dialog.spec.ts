import { TestBed } from '@angular/core/testing';

import { TranslationService } from '@core';
import { TeamStoreService } from '@shared';
import {
  createAssigneeFixture,
  createTeamStoreMock,
  createTranslationServiceMock,
} from '../../../testing/test-utils';
import { TaskFormDialogComponent } from './task-form-dialog';

describe('TaskFormDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormDialogComponent],
      providers: [
        { provide: TranslationService, useValue: createTranslationServiceMock() },
        {
          provide: TeamStoreService,
          useValue: createTeamStoreMock([createAssigneeFixture({ id: 'u1', name: 'Assignee One' })]),
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TaskFormDialogComponent);
    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
