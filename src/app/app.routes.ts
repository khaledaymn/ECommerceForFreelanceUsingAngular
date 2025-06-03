import type { Routes } from "@angular/router"
import { AuthGuard } from "./guards/auth.guard"
import { RoleGuard } from "./guards/role.guard"
import { OrdersComponent } from "./pages/orders/orders.component"
import { OrderDetailsComponent } from "./pages/orders/order-details/order-details.component"
import { OrderStatusBadgeComponent } from "./pages/orders/order-status-badge/order-status-badge.component"

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./pages/dashboard/dashboard.component").then((m) => m.DashboardComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "products",
    loadComponent: () => import("./pages/products/products.component").then((m) => m.ProductsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "orders",
    component:OrdersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "order",
    component:OrderDetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "or",
    component:OrderStatusBadgeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "customers",
    loadComponent: () => import("./pages/customers/customers.component").then((m) => m.CustomersComponent),
    canActivate: [RoleGuard],
    data: { roles: ["admin", "manager", "sales"] },
  },
  {
    path: "inventory",
    loadComponent: () => import("./pages/inventory/inventory.component").then((m) => m.InventoryComponent),
    canActivate: [RoleGuard],
    data: { roles: ["admin", "manager"] },
  },
  {
    path: "analytics",
    loadComponent: () => import("./pages/analytics/analytics.component").then((m) => m.AnalyticsComponent),
    canActivate: [RoleGuard],
    data: { roles: ["admin", "manager"] },
  },
  {
    path: "settings",
    loadComponent: () => import("./pages/settings/settings.component").then((m) => m.SettingsComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "auth",
    children: [
      {
        path: "login",
        loadComponent: () => import("./pages/auth/login/login.component").then((m) => m.LoginComponent),
      },
      {
        path: "register",
        loadComponent: () => import("./pages/auth/register/register.component").then((m) => m.RegisterComponent),
      },
      {
        path: "forgot-password",
        loadComponent: () =>
          import("./pages/auth/forgot-password/forgot-password.component").then((m) => m.ForgotPasswordComponent),
      },
      {
        path: "reset-password",
        loadComponent: () =>
          import("./pages/auth/reset-password/reset-password.component").then((m) => m.ResetPasswordComponent),
      },
    ],
  },
  {
    path: "**",
    redirectTo: "",
  },
]
