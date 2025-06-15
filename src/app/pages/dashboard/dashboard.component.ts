import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardCardComponent } from './dashboard-card/dashboard-card.component';
import { ChartComponent } from './chart/chart.component';
import { RecentSalesComponent } from './recent-sales/recent-sales.component';
import { DashboardService } from '../../services/dashboard.service';
import { SalesSummary } from '../../interfaces/sales-summary.interface';
import { Sale } from '../../interfaces/sale.interface';
import { ChartData } from '../../interfaces/chart-data.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DashboardCardComponent,
    ChartComponent,
    RecentSalesComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  salesSummary: SalesSummary = {
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    customersChange: 0,
  };

  recentSales: Sale[] = [];
  chartData: ChartData = { labels: [], datasets: [] };
  isLoading = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;

    // Load sales summary
    this.dashboardService.getSalesSummary().subscribe({
      next: (data) => {
        this.salesSummary = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sales summary', error);
        this.isLoading = false;
      },
    });

    // Load recent sales
    this.dashboardService.getRecentSales().subscribe({
      next: (data) => {
        this.recentSales = data;
      },
      error: (error) => {
        console.error('Error loading recent sales', error);
      },
    });

    // Load chart data
    this.dashboardService.getSalesChartData().subscribe({
      next: (data) => {
        this.chartData = data;
      },
      error: (error) => {
        console.error('Error loading chart data', error);
      },
    });
  }
}
