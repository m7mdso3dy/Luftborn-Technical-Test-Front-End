import { TestBed } from '@angular/core/testing';

import { TranslationService } from '@core';
import { createTaskFixture, createTranslationServiceMock } from '../../../testing/test-utils';
import { TaskCardComponent } from './task-card';

describe('TaskCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [{ provide: TranslationService, useValue: createTranslationServiceMock() }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput('task', createTaskFixture());
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should emit cardClick when card is activated (non-team layout)', () => {
    const task = createTaskFixture();
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput('task', task);
    fixture.detectChanges();
    const spy = vi.fn();
    fixture.componentInstance.cardClick.subscribe(spy);
    fixture.componentInstance.handleCardActivate();
    expect(spy).toHaveBeenCalledWith(task);
  });

  it('should emit menuToggle when menu button is clicked', () => {
    const fixture = TestBed.createComponent(TaskCardComponent);
    fixture.componentRef.setInput('task', createTaskFixture({ id: 't-menu' }));
    fixture.detectChanges();
    const spy = vi.fn();
    fixture.componentInstance.menuToggle.subscribe(spy);
    const ev = new MouseEvent('click', { bubbles: true });
    const stop = vi.spyOn(ev, 'stopPropagation');
    fixture.componentInstance.onMenuButtonClick(ev);
    expect(stop).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].task.id).toBe('t-menu');
  });
});
