import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated() && !this.authService.isSessionExpired()) {
      return true;
    }

    this.authService.logout();

    // Store the attempted URL for redirecting after login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

/**
 * Functional guard for protecting routes (Angular 19 syntax)
 */
export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  // Use Angular's `inject` to obtain required services in a functional guard
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && !authService.isSessionExpired()) {
    return true;
  }

  authService.logout();
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
