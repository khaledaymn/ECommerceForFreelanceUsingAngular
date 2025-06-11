import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.authService.isAuthenticated()) {
      // Check if route requires authentication
      if (route.data['requiresAuth']) {
        // If the route requires authentication, check if the user is logged in
        if (!this.authService.isAuthenticated()) {
          // Redirect to login page with return url
          return this.router.createUrlTree(['/login'], {
            queryParams: { returnUrl: state.url },
          });
        }
      }

      // Check if route has role requirements
      if (route.data['requiredRole']) {
        const hasRole = this.authService.hasRole(route.data['requiredRole']);
        if (!hasRole) {
          // Redirect to unauthorized page or dashboard
          return this.router.createUrlTree(['/unauthorized']);
        }
      }

      return true;
    }

    // Redirect to login page with return url
    return this.router.createUrlTree(['/login'], {
      queryParams: { returnUrl: state.url },
    });
  }
}
