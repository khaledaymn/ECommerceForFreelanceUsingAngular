import { Routes } from '@angular/router';
import { LoginComponent } from './pages/auth/login/login.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CategoryManagementComponent } from './pages/categories/categories.component';
import { ProductManagementComponent } from './pages/products/products.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { OrderDetailsComponent } from './pages/orders/order-details/order-details.component';
import { UsersComponent } from './pages/users/users/users.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { AnalyticsComponent } from './pages/analytics/analytics.component';
import { UserManagementComponent } from './pages/auth/change-email/change-email.component';
import { ContentComponent } from './pages/Content/Content.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login', // or '/admin/dashboard' if authenticated
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {
    path: 'admin',
    data: { role: 'Admin' },
    children: [
      { path: '', component: ProductManagementComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'categories', component: CategoryManagementComponent },
      { path: 'products', component: ProductManagementComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'orders/:id', component: OrderDetailsComponent },
      { path: 'customers', component: UsersComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'content', component: ContentComponent },
      { path: 'settings', component: UserManagementComponent },
    ],
  },
  {
    path: 'user',
    // canActivate: [authGuard, RoleGuard],
    data: { role: 'User' },
    children: [
      { path: '', component: DashboardComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'orders/:id', component: OrderDetailsComponent },
    ],
  },
  { path: '**', redirectTo: '/login' },
];
