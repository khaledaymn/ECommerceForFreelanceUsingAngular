import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { SalesSummary } from '../interfaces/sales-summary.interface';
import { Sale } from '../interfaces/sale.interface';
import { ChartData } from '../interfaces/chart-data.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private endpoint = 'dashboard';
  private useMockData = true; // Set to false when real API is available

  constructor(private apiService: ApiService) {}

  /**
   * Get sales summary data
   */
  getSalesSummary(): Observable<SalesSummary> {
    if (this.useMockData) {
      const mockSummary: SalesSummary = {
        revenue: 45231.89,
        orders: 573,
        products: 1248,
        customers: 12234,
        revenueChange: 20.1,
        ordersChange: 12.4,
        productsChange: 8.2,
        customersChange: 5.7,
      };

      return of(mockSummary).pipe(delay(500)); // Simulate network delay
    }

    return this.apiService.get<SalesSummary>(`${this.endpoint}/summary`);
  }

  /**
   * Get recent sales
   */
  getRecentSales(limit = 5): Observable<Sale[]> {
    if (this.useMockData) {
      const mockSales: Sale[] = [
        {
          id: '1',
          customerName: 'أحمد محمد',
          customerEmail: 'ahmed.mohamed@example.com',
          amount: '+1,999.00 ر.س.',
          initials: 'أم',
          date: new Date(),
        },
        {
          id: '2',
          customerName: 'سارة عبدالله',
          customerEmail: 'sara.abdullah@example.com',
          amount: '+39,500.00 ر.س.',
          initials: 'سع',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        },
        {
          id: '3',
          customerName: 'خالد العمري',
          customerEmail: 'khalid.omari@example.com',
          amount: '+12,350.00 ر.س.',
          initials: 'خع',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
        {
          id: '4',
          customerName: 'فاطمة الزهراء',
          customerEmail: 'fatima.zahra@example.com',
          amount: '+8,750.00 ر.س.',
          initials: 'فز',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        },
        {
          id: '5',
          customerName: 'محمد السيد',
          customerEmail: 'mohamed.elsayed@example.com',
          amount: '+5,250.00 ر.س.',
          initials: 'مس',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        },
      ];

      return of(mockSales.slice(0, limit)).pipe(delay(300)); // Simulate network delay
    }

    return this.apiService.get<Sale[]>(`${this.endpoint}/recent-sales`, {
      limit,
    });
  }

  /**
   * Get chart data for sales overview
   */
  getSalesChartData(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Observable<ChartData> {
    if (this.useMockData) {
      const mockChartData: ChartData = {
        labels: [
          'يناير',
          'فبراير',
          'مارس',
          'أبريل',
          'مايو',
          'يونيو',
          'يوليو',
          'أغسطس',
          'سبتمبر',
          'أكتوبر',
          'نوفمبر',
          'ديسمبر',
        ],
        datasets: [
          {
            label: 'الإيرادات',
            data: [
              18000, 22000, 32000, 28000, 35000, 42000, 38000, 45000, 48000,
              52000, 58000, 65000,
            ],
          },
        ],
      };

      return of(mockChartData).pipe(delay(400)); // Simulate network delay
    }

    return this.apiService.get<ChartData>(`${this.endpoint}/chart-data`, {
      period,
    });
  }
}
