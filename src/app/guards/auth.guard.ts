// import { Injectable } from "@angular/core"
// import   { Router, CanActivateFn } from "@angular/router"
// import   { AuthService } from "../services/auth.service"

// @Injectable({
//   providedIn: "root",
// })
// export class AuthGuard {
//   constructor(
//     private authService: AuthService,
//     private router: Router,
//   ) {}

//   canActivate: CanActivateFn = () => {
//     if (this.authService.isAuthenticated) {
//       return true
//     }

//     // Redirect to login page if not authenticated
//     this.router.navigate(["/auth/login"])
//     return false
//   }
// }
