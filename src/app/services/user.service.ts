import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User, UsersResponse, UsersFilter } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private cache = new Map<string, { data: UsersResponse; timestamp: number }>();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {}

  getUsers(filter: UsersFilter): Observable<UsersResponse> {
    const cacheKey = JSON.stringify(filter);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return of(cached.data);
    }

    let params = new HttpParams()
      .set('PageIndex', filter.pageIndex ?? 0)
      .set('PageSize', filter.pageSize ?? 10);

    if (filter.search) {
      params = params.set('Search', filter.search);
    }

    if (filter.sortProp !== undefined) {
      params = params.set('SortProp', filter.sortProp.toString());
    }

    if (filter.sortDirection !== undefined) {
      params = params.set('SortDirection', filter.sortDirection.toString());
    }

    if (filter.isDeleted !== undefined) {
      params = params.set('IsDeleted', filter.isDeleted.toString());
    }

    console.log(`Fetching users with filter: ${JSON.stringify(filter)}`);
    console.log(`Cache status for key "${cacheKey}": ${cached ? 'HIT' : 'MISS'}`);
    console.log(`Final HTTP params: ${params.toString()}`);

    return this.http.get<UsersResponse>(`${this.apiUrl}/Users/GetAllUsers`, { params }).pipe(
      tap((response) => {
        this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
      })
    );
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/Users/GetUserById/${id}`);
  }

  updateUser(id: string, user: Partial<User>): Observable<void> {
    this.cache.clear(); // Clear cache to ensure data consistency
    return this.http.put<void>(`${this.apiUrl}/Users/UpdateUser/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    this.cache.clear(); // Clear cache to ensure data consistency
    return this.http.delete<void>(`${this.apiUrl}/Users/ToggleUserBlock/${id}`);
  }
}