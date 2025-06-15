import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

interface LoginResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  message: string;
  token: string;
  roles: string; // Single role as "User" or "Admin"
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string; // Single role
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl || '[invalid url, do not cite]';
  private tokenKey = 'auth_token';
  private rolesKey = 'auth_roles';
  private userKey = 'auth_user';
  private firstLoginKey = 'first_login';
  public redirectUrl: string | null = null;

  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.loadUserFromToken();
  }

  login(email: string, password: string): Observable<User> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/Authentication/Login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          this.setToken(response.token);
          this.setRoles(response.roles);
          this.setUser({
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            role: response.roles,
          });
          localStorage.setItem(this.firstLoginKey, 'false');
        }),
        map((response) => ({
          id: response.id,
          email: response.email,
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.roles,
        })),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.rolesKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.firstLoginKey);
    this.redirectUrl = null;
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  isFirstLogin(): boolean {
    const firstLogin = localStorage.getItem(this.firstLoginKey);
    return firstLogin === null || firstLogin === 'true';
  }

  hasRole(role: string): boolean {
    const storedRole = this.getRoles();
    return storedRole === role;
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRoles(): string | null {
    return localStorage.getItem(this.rolesKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setRoles(role: string): void {
    localStorage.setItem(this.rolesKey, role);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    const user = this.getCurrentUser();
    if (token && this.isAuthenticated() && user) {
      // User is already loaded
    } else {
      this.logout();
    }
  }

  resetPassword(
    email: string,
    token: string,
    password: string
  ): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/Authentication/resetPassword`,
        { email, token, password }
      )
      .pipe(catchError(this.handleError));
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(
        `${this.apiUrl}/Authentication/forgetPassword`,
        { email }
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden.';
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
