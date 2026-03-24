import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DashboardOutletComponent } from './dashboard-outlet.component';
import { ShellOutletComponent } from './shell-outlet.component';

describe('DashboardOutletComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardOutletComponent],
      providers: [provideRouter([{ path: '**', component: ShellOutletComponent }])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DashboardOutletComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
