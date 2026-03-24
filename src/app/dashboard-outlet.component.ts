import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Nests `/dashboard/*` child routes inside the main dashboard layout. */
@Component({
  selector: 'app-dashboard-outlet',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class DashboardOutletComponent {}
