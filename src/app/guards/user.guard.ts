// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// export const customerGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (authService.isAuthenticated() && authService.hasRole('customer')) {
//     return true; // Customer user, allow access
//   } else if (authService.isAuthenticated()) {
//     // Authenticated but not customer, redirect to admin dashboard
//     return router.createUrlTree(['/admin/dashboard']);
//   } else {
//     // Not authenticated, redirect to login
//     authService.redirectUrl = state.url;
//     return router.createUrlTree(['/login']);
//   }
// };
