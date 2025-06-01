import { Injectable } from "@angular/core"
import   { Router, CanActivateFn, ActivatedRouteSnapshot } from "@angular/router"
import   { AuthService } from "../services/auth.service"

@Injectable({
  providedIn: "root",
})
export class RoleGuard {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    // Get the required roles from the route data
    const requiredRoles = route.data["roles"] as string[]

    if (
      this.authService.isAuthenticated &&
      requiredRoles &&
      requiredRoles.some((role) => this.authService.currentUser?.role === role)
    ) {
      return true
    }

    // If user is authenticated but doesn't have the required role, redirect to dashboard
    if (this.authService.isAuthenticated) {
      this.router.navigate(["/"])
      return false
    }

    // If user is not authenticated, redirect to login
    this.router.navigate(["/auth/login"])
    return false
  }
}
