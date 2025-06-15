import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ApiResponse,
  ApiListResponse,
  ApiErrorResponse,
} from '../interfaces/api-response.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://api.example.com'; // Replace with your actual API URL

  constructor(private http: HttpClient) {}

  /**
   * Generic GET method for fetching a single resource
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const options = { params: this.buildParams(params) };

    return this.http
      .get<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, options)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Generic GET method for fetching a list of resources
   */
  getList<T>(
    endpoint: string,
    params?: any
  ): Observable<{ data: T[]; meta: any }> {
    const options = { params: this.buildParams(params) };

    return this.http
      .get<ApiListResponse<T>>(`${this.apiUrl}/${endpoint}`, options)
      .pipe(
        map((response) => ({
          data: response.data,
          meta: response.meta,
        })),
        catchError(this.handleError)
      );
  }

  /**
   * Generic POST method
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Generic PUT method
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Generic PATCH method
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Generic DELETE method
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`).pipe(
      map((response) => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Build HttpParams from an object
   */
  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return httpParams;
  }

  /**
   * Error handler
   */
  private handleError(error: any) {
    let errorMessage = 'حدث خطأ في الاتصال بالخادم';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `خطأ: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      // Server-side error with message
      errorMessage = error.error.message;
    } else if (error.status) {
      // Server-side error with status
      switch (error.status) {
        case 401:
          errorMessage = 'غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.';
          break;
        case 403:
          errorMessage = 'ليس لديك صلاحية للوصول إلى هذا المورد.';
          break;
        case 404:
          errorMessage = 'المورد المطلوب غير موجود.';
          break;
        case 500:
          errorMessage = 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.';
          break;
        default:
          errorMessage = `حدث خطأ: ${error.statusText}`;
      }
    }

    // Log the error for debugging
    console.error('API Error:', error);

    // Return an observable with a user-facing error message
    return throwError(() => {
      const apiError: ApiErrorResponse = {
        success: false,
        message: errorMessage,
        statusCode: error.status,
      };
      return apiError;
    });
  }
}
