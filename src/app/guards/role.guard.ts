// import { Injectable, inject } from '@angular/core';
// import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// @Injectable({
//   providedIn: 'root',
// })
// export class RoleGuard {
//   private authService = inject(AuthService);
//   private router = inject(Router);

//   // canActivate: CanActivateFn = (route: ActivatedRouteSnapshot) => {
//   //   const requiredRole = route.data['role'] as string;
//   //   const storedRole = this.authService.getRoles();

//   //   if (!this.authService.isAuthenticated()) {
//   //     this.router.navigate(['/login']);
//   //     return false;
//   //   }

//   //   if (storedRole && this.authService.hasRole(requiredRole)) {
//   //     return true;
//   //   }

//   //   // Redirect based on stored role
//   //   if (storedRole === 'Admin') {
//   //     this.router.navigate(['/admin/dashboard']);
//   //     return false;
//   //   }
//   //   this.router.navigate(['/user/dashboard']);
//   //   return false;
//   // };
// }
