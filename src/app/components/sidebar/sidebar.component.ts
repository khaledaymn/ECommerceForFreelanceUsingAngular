import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  isCollapsed = false;

  menuItems: MenuItem[] = [
    // {
    //   label: 'لوحة التحكم',
    //   route: '/admin/dashboard',
    //   icon: 'dashboard',
    // },
    {
      label: 'الفئات',
      route: '/admin/categories',
      icon: 'category',
    },
    {
      label: 'المنتجات',
      route: '/admin/products',
      icon: 'inventory_2',
    },
    // {
    //   label: 'الطلبات',
    //   route: '/admin/orders',
    //   icon: 'shopping_cart',
    // },
    {
      label: 'العملاء',
      route: '/admin/customers',
      icon: 'people',
    },
    // {
    //   label: 'المخزون',
    //   route: '/inventory',
    //   icon: 'inventory',
    // },
    // {
    //   label: 'التحليلات',
    //   route: '/analytics',
    //   icon: 'analytics',
    // },
  ];

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
