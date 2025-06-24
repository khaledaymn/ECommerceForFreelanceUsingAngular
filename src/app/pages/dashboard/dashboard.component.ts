// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardCardComponent } from './dashboard-card/dashboard-card.component';
// import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../interfaces/dashboard.interface';
import { DashboardService } from '../../services/dashboard.service';
import { OrderService } from '../../services/order.service';
// import { DashboardData } from '../../interfaces/dashboard-data.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  dashboardData: DashboardData = {
    totalProducts: 0,
    totalRentProducts: 0,
    totalPurchaseProducts: 0,
    totalRentAndPurchaseProducts: 0,
    totalNewOrders: 0,
    totalProcessingOrders: 0,
    totalCompletedOrders: 0,
    totalCancelledOrders: 0,
    totalRentOrders: 0,
    totalPurchaseOrders: 0,
  };

  isLoading = true;

  constructor(private dashboardService: OrderService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data', error);
        this.isLoading = false;
      },
    });
  }

  // دوال مساعدة (يمكن إضافتها لاحقًا إذا أردت نسب تغيير)
  isPositive(): boolean {
    return false; // يمكن تحديثها إذا كان هناك تغيير
  }
  isNegative(): boolean {
    return false; // يمكن تحديثها إذا كان هناك تغيير
  }
}
