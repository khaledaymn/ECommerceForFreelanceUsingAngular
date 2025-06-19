import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
import {
  CreateProduct,
  Product,
  ProductParams,
  UpdateProduct,
} from '../interfaces/product.interface';
import { PaginatedResponse, Result } from '../interfaces/category';
import { ApiError } from './category.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly baseUrl = environment.apiUrl + '/Products'; // Replace with your actual API URL
  private readonly maxRetries = 2;
  private readonly allowedImageExtensions = [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.svg',
  ];
  private readonly allowedVideoExtensions = ['.mp4', '.webm', '.mov', '.mkv'];
  private readonly maxAllowedImageSize = 3 * 1024 * 1024; // 3MB
  private readonly maxAllowedVideoSize = 10 * 1024 * 1024; // 10MB
  private readonly errorMessages: Record<string, string> = {
    default: 'An unexpected error occurred. Please try again later.',
    validation: 'Invalid input provided. Please check your data and try again.',
    notFound: 'The requested product was not found.',
    server: 'A server error occurred. Please try again later.',
    network:
      'Unable to connect to the server. Please check your internet connection.',
    imageSize: 'Image file size exceeds 3MB.',
    imageType:
      'Invalid image file type. Allowed types: .png, .jpg, .jpeg, .webp, .svg.',
    videoSize: 'Video file size exceeds 10MB.',
    videoType:
      'Invalid video file type. Allowed types: .mp4, .webm, .mov, .mkv.',
  };
  constructor(private http: HttpClient) {}

  createProduct(product: CreateProduct): Observable<Result> {
    // Client-side validation
    if (product.mainImage && !this.validateImageFile(product.mainImage)) {
      return throwError(
        () => new ApiError(400, 'validation', this.errorMessages['imageType'])
      );
    }

    const formData = new FormData();
    formData.append('name', product.name);
    if (product.description)
      formData.append('description', product.description);
    if (product.additionalAttributes) {
      formData.append(
        'AdditionalAttributesJson',
        JSON.stringify(product.additionalAttributes)
      );
    }
    if (product.brand) formData.append('brand', product.brand);
    if (product.model) formData.append('model', product.model);
    if (product.status) formData.append('status', product.status);
    formData.append('categoryId', product.categoryId.toString());
    if (product.mainImage) formData.append('mainImage', product.mainImage);
    if (product.additionalMedia && product.additionalMedia.length > 0) {
      product.additionalMedia.forEach((file) => {
        formData.append('AdditionalMedia', file);
      });
    }

    return this.http.post<Result>(`${this.baseUrl}/Create`, formData).pipe(
      retry({ count: this.maxRetries }),
      catchError((error) =>
        this.handleError(error, 'createProduct', { name: product.name })
      )
    );
  }

  getAllProducts(
    params: ProductParams = { pageIndex: 1, pageSize: 10 }
  ): Observable<PaginatedResponse<Product>> {
    let httpParams = new HttpParams()
      .set('pageIndex', params.pageIndex.toString())
      .set('pageSize', Math.min(params.pageSize, 10).toString())
      .set('search', params.search ?? '');
    // .set('description', params.description ?? '');
    if (params.attributesFilter) {
      Object.entries(params.attributesFilter).forEach(([key, value]) => {
        httpParams = httpParams.set(`attributesFilter[${key}]`, value);
      });
    }
    if (params.categoryId)
      httpParams = httpParams.set('categoryId', params.categoryId.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.sortProp)
      httpParams = httpParams.set('sortProp', params.sortProp);
    if (params.sortDirection)
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    console.log(params);

    return this.http
      .get<PaginatedResponse<Product>>(`${this.baseUrl}/GetAllProducts`, {
        params: httpParams,
      })
      .pipe(
        retry({ count: this.maxRetries }),
        catchError((error) =>
          this.handleError(error, 'getAllProducts', {
            search: params.search,
            categoryId: params.categoryId,
            pageIndex: params.pageIndex,
            pageSize: params.pageSize,
          })
        )
      );
  }

  readProductById(id: number): Observable<Product> {
    if (id < 1) {
      return throwError(
        () =>
          new ApiError(
            400,
            'validation',
            'Product ID must be a positive integer.'
          )
      );
    }

    return this.http.get<Product>(`${this.baseUrl}/GetById/${id}`).pipe(
      retry({ count: this.maxRetries }),
      catchError((error) => this.handleError(error, 'readProductById', { id }))
    );
  }

  updateProduct(product: UpdateProduct): Observable<Result> {
    if (!product.id || product.id <= 0) {
      return throwError(
        () =>
          new ApiError(
            400,
            'validation',
            'Product ID must be a positive integer.'
          )
      );
    }
    if (product.mainImage && !this.validateImageFile(product.mainImage)) {
      return throwError(
        () => new ApiError(400, 'validation', this.errorMessages['imageType'])
      );
    }
    // if (
    //   product.additionalMedia &&
    //   !this.validateMediaFiles(product.additionalMedia)
    // ) {
    //   return throwError(
    //     () =>
    //       new ApiError(
    //         400,
    //         'validation',
    //         this.getMediaValidationError(product.additionalMedia)
    //       )
    //   );
    // }

    let params = new HttpParams()
      .set('Id', product.id.toString())
      .set('Name', product.name || '')
      .set('Description', product.description || '')
      .set('Brand', product.brand || '')
      .set('Model', product.model || '')
      .set('Quantity', product.quantity?.toString() || '0')
      .set('Status', product.status || '')
      .set('CategoryId', product.categoryId?.toString() || '0');

    // Normalize AdditionalAttributes
    const attributes =
      product.additionalAttributes &&
      Object.keys(product.additionalAttributes).length > 0
        ? product.additionalAttributes
        : {};
    console.log('AdditionalAttributes before stringify:', attributes);
    // try {
    //   const attributesString = JSON.stringify(attributes);
    //   params = params.set('AdditionalAttributes', attributesString);
    // } catch (e) {
    //   return throwError(
    //     () =>
    //       new ApiError(
    //         400,
    //         'validation',
    //         'Failed to serialize AdditionalAttributes.'
    //       )
    //   );
    // }

    if (product.mediaToDelete && product.mediaToDelete.length > 0) {
      params = params.set(
        `MediaToDelete`,
        JSON.stringify(product.mediaToDelete)
      );
    }

    const formData = new FormData();
    if (product.mainImage) {
      formData.append('MainImage', product.mainImage);
    }
    if (product.additionalMedia && product.additionalMedia.length > 0) {
      product.additionalMedia.forEach((file) => {
        formData.append('AdditionalMedia', file);
      });
    }

    const debugData: { [key: string]: any } = {};
    for (const [key, value] of formData.entries()) {
      debugData[key] = value instanceof File ? value.name : value;
    }
    console.log('Query Params in updateProduct:', params.toString());
    console.log('FormData in updateProduct:', debugData);

    return this.http
      .put<Result>(`${this.baseUrl}/Update`, formData, {
        headers: { Accept: 'text/plain' },
        params,
      })
      .pipe(
        retry({ count: this.maxRetries }),
        catchError((error) =>
          this.handleError(error, 'updateProduct', { id: product.id })
        )
      );
  }
  // updateProduct(product: UpdateProduct): Observable<Result> {
  //   // Client-side validation
  //   if (!product.id || product.id <= 0) {
  //     return throwError(
  //       () =>
  //         new ApiError(
  //           400,
  //           'validation',
  //           'Product ID must be a positive integer.'
  //         )
  //     );
  //   }
  //   if (product.mainImage && !this.validateImageFile(product.mainImage)) {
  //     return throwError(
  //       () => new ApiError(400, 'validation', this.errorMessages['imageType'])
  //     );
  //   }
  //   // if (
  //   //   product.additionalMedia &&
  //   //   !this.validateMediaFiles(product.additionalMedia)
  //   // ) {
  //   //   return throwError(
  //   //     () =>
  //   //       new ApiError(
  //   //         400,
  //   //         'validation',
  //   //         this.getMediaValidationError(product.additionalMedia)
  //   //       )
  //   //   );
  //   // }

  //   const formData = new FormData();
  //   formData.append('id', product.id.toString());
  //   formData.append('name', product.name ?? '');
  //   if (product.description)
  //     formData.append('description', product.description);
  //   if (product.additionalAttributes) {
  //     formData.append(
  //       'AdditionalAttributesJson',
  //       JSON.stringify(product.additionalAttributes)
  //     );
  //   }
  //   if (product.brand) formData.append('brand', product.brand);
  //   if (product.model) formData.append('model', product.model);
  //   if (product.status) formData.append('status', product.status);
  //   if (product.mediaToDelete && product.mediaToDelete.length > 0) {
  //     product.mediaToDelete.forEach((mediaId, index) => {
  //       formData.append(`mediaToDelete[${index}]`, mediaId);
  //     });
  //   }
  //   if (product.categoryId)
  //     formData.append('categoryId', product.categoryId.toString());
  //   if (product.mainImage) formData.append('mainImage', product.mainImage);
  //   if (product.additionalMedia && product.additionalMedia.length > 0) {
  //     product.additionalMedia.forEach((file) => {
  //       formData.append('AdditionalMedia', file);
  //     });
  //   }
  //   console.log(...formData, 'formData in updateProduct');
  //   return this.http.put<Result>(`${this.baseUrl}/update`, formData).pipe(
  //     retry({ count: this.maxRetries }),
  //     catchError((error) =>
  //       this.handleError(error, 'updateProduct', { id: product.id })
  //     )
  //   );
  // }
  deleteProduct(id: number): Observable<Result> {
    if (id < 1) {
      return throwError(
        () =>
          new ApiError(
            400,
            'validation',
            'Product ID must be a positive integer.'
          )
      );
    }

    return this.http.delete<Result>(`${this.baseUrl}/Delete/${id}`).pipe(
      retry({ count: this.maxRetries }),
      catchError((error) => this.handleError(error, 'deleteProduct', { id }))
    );
  }

  private validateImageFile(file: File): boolean {
    const extension = file.name
      .substring(file.name.lastIndexOf('.'))
      .toLowerCase();
    if (!this.allowedImageExtensions.includes(extension)) {
      return false;
    }
    if (file.size > this.maxAllowedImageSize) {
      return false;
    }
    return true;
  }

  private validateVideoFile(file: File): boolean {
    const extension = file.name
      .substring(file.name.lastIndexOf('.'))
      .toLowerCase();
    if (!this.allowedVideoExtensions.includes(extension)) {
      return false;
    }
    if (file.size > this.maxAllowedVideoSize) {
      return false;
    }
    return true;
  }

  // private validateMediaFiles(files: File[]): boolean {
  //   return files.every((file) => {
  //     const extension = file.name
  //       .substring(file.name.lastIndexOf('.'))
  //       .toLowerCase();
  //     if (this.allowedImageExtensions.includes(extension)) {
  //       return file.size <= this.maxAllowedImageSize;
  //     } else if (this.allowedVideoExtensions.includes(extension)) {
  //       return file.size <= this.maxAllowedVideoSize;
  //     }
  //     return false;
  //   });
  // }

  private handleError(
    error: HttpErrorResponse,
    operation: string,
    context: unknown
  ): Observable<never> {
    let errorType: ApiError['errorType'] = 'unknown';
    let message = this.errorMessages['default'];
    const details = {
      operation,
      ...(typeof context === 'object' && context !== null ? context : {}),
      backendError: error.error,
    };

    if (!error.status) {
      errorType = 'network';
      message = this.errorMessages['network'];
    } else if (error.status === 400) {
      errorType = 'validation';
      message =
        (error.error as Result)?.message ?? this.errorMessages['validation'];
    } else if (error.status === 404) {
      errorType = 'not-found';
      message =
        (error.error as Result)?.message ?? this.errorMessages['notFound'];
    } else if (error.status >= 500) {
      errorType = 'server';
      message =
        (error.error as Result)?.message ?? this.errorMessages['server'];
    }

    console.error(`[${operation}] API Error:`, {
      status: error.status,
      errorType,
      message,
      details,
    });

    return throwError(
      () => new ApiError(error.status, errorType, message, details)
    );
  }
}
