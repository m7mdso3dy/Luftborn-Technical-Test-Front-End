import { TestBed } from '@angular/core/testing';

import { ShellOutletComponent } from './shell-outlet.component';

describe('ShellOutletComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellOutletComponent],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(ShellOutletComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
