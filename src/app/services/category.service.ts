import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http"
import { catchError, Observable, retry, throwError } from "rxjs"
import { environment } from "../enviroments/enviroment"
import { AddCategory, Category, CategoryParams, PaginatedResponse, Result, UpdateCategory } from "../interfaces/category"

export class ApiError extends Error {
  constructor(
    public status: number,
    public errorType: 'validation' | 'not-found' | 'server' | 'network' | 'unknown',
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
@Injectable({
  providedIn: "root",
})
export class CategoryService {
  private readonly baseUrl = environment.apiUrl+ '/Categories' // Replace with your actual API URL
private readonly maxRetries = 2;
private readonly errorMessages: Record<string, string> = {

  default: 'An unexpected error occurred. Please try again later.',
    validation: 'Invalid input provided. Please check your data and try again.',
    notFound: 'The requested resource was not found.',
    server: 'A server error occurred. Please try again later.',
    network: 'Unable to connect to the server. Please check your internet connection.',
    fileSize: 'Image file size exceeds 3MB.',
    fileType: 'Invalid image file type. Allowed types: .png, .jpg, .jpeg, .webp, .svg.'
  };

  constructor(private http: HttpClient) {}

  getAllCategories(params: CategoryParams): Observable<PaginatedResponse<Category>> {
    let httpParams = new HttpParams()
      .set('pageIndex', params.pageIndex.toString())
      .set('pageSize', params.pageSize.toString())
      .set('search', params?.search ?? '')
      .set('sortProp', params.sortProp ?? '')
      .set('sortDirection', params.sortDirection??'');


    return this.http.get<PaginatedResponse<Category>>(`${this.baseUrl}/GetAllCategories`, { params: httpParams }).pipe(
      retry({ count: this.maxRetries, delay: 1000 }),
      catchError((error) => this.handleError(error, 'getAllCategories', { pageIndex: params.pageIndex, pageSize: params.pageSize }))
    );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/GetCategoryById/${id}`).pipe(
      retry({ count: this.maxRetries, delay: 1000 }),
      catchError((error) => this.handleError(error, 'readCategoryById', { id }))
    );
  }


  createCategory(category: AddCategory): Observable<Result> {
    // Client-side file validation
    if (category.image && !this.validateImage(category.image)) {
      return throwError(() => new ApiError(400, 'validation', this.errorMessages['fileType']));
    }

    const formData = new FormData();
    formData.append('name', category.name);
    if (category.description) formData.append('description', category.description);
    if (category.image) formData.append('image', category.image);

    return this.http.post<Result>(`${this.baseUrl}/AddCategory`, formData).pipe(
      retry({ count: this.maxRetries, delay: 1000 }), // Retry on transient errors
      catchError((error) => this.handleError(error, 'createCategory', { name: category.name }))
    );
  }

  updateCategory(category: UpdateCategory): Observable<Result> {
    // Client-side file validation
    if (category.image && !this.validateImage(category.image)) {
      return throwError(() => new ApiError(400, 'validation', this.errorMessages['fileType']));
    }

    const formData = new FormData();
    formData.append('id', category.id.toString());
    if (category.name) formData.append('name', category.name);
    if (category.description) formData.append('description', category.description);
    if (category.image) formData.append('image', category.image);

    return this.http.put<Result>(`${this.baseUrl}/UpdateCategory`, formData).pipe(
      retry({ count: this.maxRetries, delay: 1000 }),
      catchError((error) => this.handleError(error, 'updateCategory', { id: category.id }))
    );
  }

  deleteCategory(id: number): Observable<Result> {
    return this.http.delete<Result>(`${this.baseUrl}/DeleteCategory/${id}`).pipe(
      retry({ count: this.maxRetries, delay: 1000 }),
      catchError((error) => this.handleError(error, 'deleteCategory', { id }))
    );
  }

 private validateImage(file: File): boolean {
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
    const maxSize = 3 * 1024 * 1024; // 3MB
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return false;
    }
    if (file.size > maxSize) {
      return false;
    }
    return true;
  }


  private handleError(error: HttpErrorResponse, operation: string, context: unknown): Observable<never> {
    let errorType: ApiError['errorType'] = 'unknown';
    let message = this.errorMessages['default'];
    const details = { operation, ...(typeof context === 'object' && context !== null ? context : {}), backendError: error.error };

    // Handle network errors (e.g., no internet, timeout)
    if (!error.status) {
      errorType = 'network';
      message = this.errorMessages['network'];
    }
    // Handle HTTP status codes
    else if (error.status === 400) {
      errorType = 'validation';
      message = (error.error as Result)?.message ?? this.errorMessages['validation'];
    } else if (error.status === 404) {
      errorType = 'not-found';
      message = (error.error as Result)?.message ?? this.errorMessages['notFound'];
    } else if (error.status >= 500) {
      errorType = 'server';
      message = (error.error as Result)?.message ?? this.errorMessages['server'];
    }

    // Structured logging for debugging
    console.error(`[${operation}] API Error:`, {
      status: error.status,
      errorType,
      message,
      details
    });

    return throwError(() => new ApiError(error.status, errorType, message, details));
  }
}
