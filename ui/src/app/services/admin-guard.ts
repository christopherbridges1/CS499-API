// Guard to protect admin routes
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuth } from './admin-auth';

// Admin guard function
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AdminAuth);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.parseUrl('/admin/login');
};
