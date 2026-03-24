import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/** Prevents authenticated users from opening the login screen; sends them to the app shell. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.getToken()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
