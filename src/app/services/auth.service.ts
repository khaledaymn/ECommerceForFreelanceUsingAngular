import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../enviroments/enviroment';
import { ResetPasswordResponse } from '../interfaces/api-response.interface';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize user state from stored token on service creation
    this.loadUserFromToken();
  }

  /**
   * Logs in a user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Observable with user data
   */
  login(email: string, password: string): Observable<User> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Authentication/login`, { email, password })
      .pipe(
        tap(response => {
          // Store token and update user state
          this.setToken(response.token);
          this.userSubject.next(response.user);
        }),
        map(response => response.user),
        catchError(this.handleError)
      );
  }

  /**
   * Logs out the current user
   */
  logout(): void {
    // Clear token and user state
    this.removeToken();
    this.userSubject.next(null);
  }

  /**
   * Checks if the user is authenticated
   * @returns boolean indicating authentication status
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    // Optionally, add token expiration check here
    return true;
  }
 hasRole(role: string): boolean {
    // Check if the current user's role matches the given role
    const user = this.getCurrentUser();
    return user != null && user.role === role;
  }
  /**
   * Gets the current user
   * @returns Current user or null
   */
  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  /**
   * Gets the auth token
   * @returns Token string or null
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Stores the auth token
   * @param token JWT token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Removes the auth token
   */
  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Loads user data from stored token
   */
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      // Decode token to get user data (assuming JWT)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user: User = {
          id: payload.sub || payload.id,
          email: payload.email,
          name: payload.name,
          role: payload.role
        };
        this.userSubject.next(user);
      } catch (error) {
        console.error('Failed to decode token:', error);
        this.removeToken();
        this.userSubject.next(null);
      }
    }
  }

  
    /**
     * Sends a password reset email
     * @param email User's email
     * @returns Observable with success message
     */
resetPassword(email: string, token: string, password: string): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(
      `${this.apiUrl}/Authentication/resetPassword`,
      { email, token, password }
    ).pipe(
      catchError(this.handleError)
    );
  }
  
    /**
     * Sends a forgot password request
     * @param email User's email
     * @returns Observable with success message
     */
  forgotPassword(email: string): Observable<any> {
    // Replace the URL with your actual forgot password endpoint
    return this.http.post<any>(`${this.apiUrl}/Authentication/forgetPassword`, { email });
  }
  /**
   * Handles HTTP errors
   * @param error HttpErrorResponse
   * @returns Observable with error message
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
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