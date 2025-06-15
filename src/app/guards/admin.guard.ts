// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// // import { AuthService } from './auth.service';

// export const adminGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (authService.isAuthenticated() && authService.hasRole('admin')) {
//     return true; // Admin user, allow access
//   } else if (authService.isAuthenticated()) {
//     // Authenticated but not admin, redirect to customer dashboard
//     return router.createUrlTree(['/']);
//   } else {
//     // Not authenticated, redirect to login
//     authService.redirectUrl = state.url;
//     return router.createUrlTree(['/login']);
//   }
// };
