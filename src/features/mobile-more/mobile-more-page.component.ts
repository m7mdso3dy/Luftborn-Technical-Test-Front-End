import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  DASHBOARD_MORE_MENU_ITEMS,
  type DashboardSideNavItem,
} from '@core/dashboard-layout/dashboard-nav.config';
import { AuthService, TranslatePipe, TranslationService } from '@core';
import { TaskFormCoordinatorService } from '@shared';

@Component({
  selector: 'app-mobile-more-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './mobile-more-page.component.html',
  styleUrl: './mobile-more-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileMorePageComponent {
  protected readonly i18n = inject(TranslationService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly taskForm = inject(TaskFormCoordinatorService);

  protected readonly menuItems: readonly DashboardSideNavItem[] = DASHBOARD_MORE_MENU_ITEMS;

  protected onNewTask(): void {
    this.taskForm.openCreate();
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
