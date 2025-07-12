import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import {
  Order,
  OrdersFilter,
  OrdersResponse,
} from '../interfaces/order.interface';
import { createLinkedSignal } from '@angular/core/primitives/signals';
import { Result } from '../interfaces/category';
import { DashboardData } from '../interfaces/dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = environment.apiUrl;
  private cache = new Map<
    string,
    { data: OrdersResponse; timestamp: number }
  >();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes
  // headers = new HttpHeaders();
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token'); // Adjust based on your token storage
    console.log(token);
    return new HttpHeaders({
      Accept: '*/*',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }
  constructor(private http: HttpClient) {}
  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(
      `${this.apiUrl}/Dashboard/GetDashboardData`
    );
  }

  getOrders(filter: OrdersFilter): Observable<OrdersResponse> {
    const cacheKey = JSON.stringify(filter);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return of(cached.data);
    }

    let params = new HttpParams()
      .set('PageIndex', filter.pageIndex ?? 0) // Default page index if not provided
      .set('PageSize', filter.pageSize ?? 10) // Default page size if not provided
      .set('Search', filter.search ?? '')
      .set('UserId', filter.userId ?? '')
      .set('OrderStatus', filter.orderStatus ?? '')
      .set('SortProp', filter.sortProp?.toString() ?? '')
      .set('SortDirection', filter.sortDirection?.toString() ?? '');

    console.log(
      filter.search,
      filter.userId,
      filter.orderStatus,
      filter.sortProp,
      filter.sortDirection
    );

    if (filter.search) {
      params.set('Search', filter.search);
    }

    if (filter.userId) {
      params.set('UserId', filter.userId);
    }

    if (filter.orderStatus) {
      params.set('OrderStatus', filter.orderStatus);
      console.log(filter.orderStatus);
    }

    if (filter.sortProp !== undefined) {
      params.set('SortProp', filter.sortProp.toString());
    }

    if (filter.sortDirection !== undefined) {
      params.set('SortDirection', filter.sortDirection.toString());
    }
    console.log(`Fetching orders with filter: ${JSON.stringify(filter)}`);
    console.log(
      `Cache status for key "${cacheKey}": ${cached ? 'HIT' : 'MISS'}`
    );
    console.log(`Final HTTP params: ${params.toString()}`);
    // const headers = new HttpHeaders({ accept: '*/*' });
    console.log(this.getHeaders());
    return this.http
      .get<OrdersResponse>(`${this.apiUrl}/orders/GetAllOrders`, {
        params,
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => {
          console.log(response);
          this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
        })
      );
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  updateOrderStatus(id: number, status: string): Observable<Result> {
    this.cache.clear(); // Clear cache
    return this.http.put<Result>(`${this.apiUrl}/orders/updateorder/${id}`, {
      id,
      status,
    });
  }

  deleteOrder(id: number): Observable<void> {
    this.cache.clear(); // Clear cache to ensure data consistency
    return this.http.delete<void>(`${this.apiUrl}/orders/deleteorder/${id}`);
  }
}
