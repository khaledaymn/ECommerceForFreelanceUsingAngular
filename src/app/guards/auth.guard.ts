// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// export const authGuard = () => {
//   const authService = inject(AuthService);
//   const router = inject(Router);
//   if (authService.isAuthenticated()) {
//     return true;
//   }
//   return router.parseUrl('/login');
// };
// // if (authService.isFirstLogin()) {
// //   if (authService.isAuthenticated()) {
// //     // First-time login: Allow access to login page or redirect to login
// //     if (state.url === '/login') {
// //       return true;
// //     }
// //     return router.createUrlTree(['/login']);
// //   } else {
// //     // Not first-time login
// //     if (authService.hasRole('Admin')) {
// //       // Redirect Admin to admin dashboard
// //       return router.createUrlTree(['/admin/dashboard']);
// //     } else {
// //       // Redirect User to user dashboard
// //       return router.createUrlTree(['/user/dashboard']);
// //     }
// //   }
// // } else {
// //   // Not authenticated: Redirect to login
// //   return router.createUrlTree(['/login']);
// // }
// // };
