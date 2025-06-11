import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  User,
  UsersResponse,
  UsersFilter,
  UserDTO,
} from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;
  private cache = new Map<
    string,
    { data: UsersResponse | User; timestamp: number }
  >();
  private readonly cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor(private http: HttpClient) {}

  getUsers(filter: UsersFilter): Observable<UsersResponse> {
    const cacheKey = JSON.stringify(filter);
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return of(cached.data as UsersResponse);
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

    if (filter.isBlocked !== undefined) {
      params = params.set('IsBlocked', filter.isBlocked.toString());
    }

    return this.http
      .get<UsersResponse>(`${this.apiUrl}/Users/GetAllUsers`, { params })
      .pipe(
        tap((response) => {
          this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
        })
      );
  }

  getUserById(id: string): Observable<User> {
    const cacheKey = `user_${id}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return of(cached.data as User);
    }

    return this.http.get<User>(`${this.apiUrl}/Users/GetUserById/${id}`).pipe(
      tap((response) => {
        this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
      })
    );
  }

  updateUser(id: string, user: UserDTO): Observable<{ message: string }> {
    return this.http
      .put<{ message: string }>(`${this.apiUrl}/Users/UpdateUser/${id}`, user)
      .pipe(
        tap(() => {
          this.cache.clear(); // Clear cache to ensure fresh data
        })
      );
  }

  toggleUserBlock(
    id: string,
    isBlock: boolean
  ): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/Users/ToggleUserBlock/${id}/${isBlock}`,
        {}
      )
      .pipe(
        tap(() => {
          this.cache.clear(); // Clear cache to ensure fresh data
        })
      );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Users/DeleteUser/${id}`).pipe(
      tap(() => {
        this.cache.clear(); // Clear cache to ensure fresh data
      })
    );
  }
}
