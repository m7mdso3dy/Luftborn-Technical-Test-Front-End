import { TestBed } from '@angular/core/testing';

import { createStatisticFixture } from '../../../testing/test-utils';
import { StatisticCardComponent } from './statistic-card';

describe('StatisticCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticCardComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StatisticCardComponent);
    fixture.componentRef.setInput('stat', createStatisticFixture());
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should expose changeColor for positive stats', () => {
    const fixture = TestBed.createComponent(StatisticCardComponent);
    fixture.componentRef.setInput('stat', createStatisticFixture({ changeType: 'positive' }));
    expect(fixture.componentInstance.changeColor).toContain('emerald');
  });
});
