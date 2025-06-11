import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { catchError, Observable, retry, throwError } from 'rxjs';
// import { environment } from '../enviroments/enviroment';
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
    if (
      product.additionalImages &&
      !this.validateMediaFiles(product.additionalImages)
    ) {
      return throwError(
        () => new ApiError(400, 'validation', this.errorMessages['videoType'])
      );
    }

    const formData = new FormData();
    formData.append('name', product.name);
    if (product.description)
      formData.append('description', product.description);
    if (product.additionalAttributes) {
      formData.append(
        'additionalAttributes',
        JSON.stringify(product.additionalAttributes)
      );
    }
    formData.append('price', product.price.toString());
    if (product.status) formData.append('status', product.status);
    formData.append('categoryId', product.categoryId.toString());
    if (product.mainImage) formData.append('mainImage', product.mainImage);
    if (product.additionalImages) {
      product.additionalImages.forEach((file, index) =>
        formData.append(`additionalImages[${index}]`, file)
      );
    }

    return this.http.post<Result>(`${this.baseUrl}/Create`, formData).pipe(
      retry({ count: this.maxRetries, delay: 1000 }),
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
        retry({ count: this.maxRetries, delay: 1000 }),
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
      retry({ count: this.maxRetries, delay: 1000 }),
      catchError((error) => this.handleError(error, 'readProductById', { id }))
    );
  }

  // updateProduct(product: UpdateProduct): Observable<Result> {
  //   // Client-side validation
  //   if (product.mainImage && !this.validateImageFile(product.mainImage)) {
  //     return throwError(
  //       () => new ApiError(400, 'validation', this.errorMessages['imageType'])
  //     );
  //   }
  //   if (
  //     product.additionalImages &&
  //     !this.validateMediaFiles(product.additionalImages)
  //   ) {
  //     return throwError(
  //       () => new ApiError(400, 'validation', this.errorMessages['videoType'])
  //     );
  //   }

  //   const formData = new FormData();
  //   formData.append('id', product.id.toString());
  //   if (product.name) formData.append('name', product.name);
  //   if (product.description)
  //     formData.append('description', product.description);

  //   // console.log(product.additionalAttributes, 'dsdddddddddddddddddddddddddddddddd');
  //   console.log(
  //     product.additionalAttributes,
  //     'dsdddddddddddddddddddddddddddddddd'
  //   );
  //   if (product.additionalAttributes) {
  //     formData.append(
  //       'additionalAttributes',
  //       JSON.stringify(product.additionalAttributes)
  //     );
  //     console.log(
  //       JSON.stringify(product.additionalAttributes) +
  //         'iffffffffff ' +
  //         product.additionalAttributes
  //     );
  //   }
  //   if (product.price !== null && product.price !== undefined) {
  //     formData.append('price', product.price.toString());
  //     console.log(product.price + ' priceeeeeeeeeeeeeeeeeeeeeeeeee');
  //   }
  //   if (product.status) formData.append('status', product.status);
  //   if (product.categoryId)
  //     formData.append('categoryId', product.categoryId.toString());
  //   if (product.mainImage) formData.append('mainImage', product.mainImage);
  //   if (product.additionalImages) {
  //     product.additionalImages.forEach((file, index) =>
  //       formData.append(`additionalImages[${index}]`, file)
  //     );
  //   }
  //   if (product.imagesToDelete) {
  //     product.imagesToDelete.forEach((url, index) =>
  //       formData.append(`imagesToDelete[${index}]`, url)
  //     );
  //   }
  //   console.log(product);

  //   return this.http.put<Result>(`${this.baseUrl}/Update`, formData).pipe(
  //     retry({ count: this.maxRetries, delay: 1000 }),
  //     catchError((error) =>
  //       this.handleError(error, 'updateProduct', { id: product.id })
  //     )
  //   );
  // }
  // updateProduct(product: UpdateProduct): Observable<Result> {
  //   // Client-side validation (only for fields included in params)
  //   // if (product.mainImage && !this.validateImageFile(product.mainImage)) {
  //   //   return throwError(
  //   //     () => new ApiError(400, 'validation', this.errorMessages['imageType'])
  //   //   );
  //   // }
  //   // if (
  //   //   product.additionalImages &&
  //   //   !this.validateMediaFiles(product.additionalImages)
  //   // ) {
  //   //   return throwError(
  //   //     () => new ApiError(400, 'validation', this.errorMessages['videoType'])
  //   //   );
  //   // }

  //   // Initialize HttpParams
  //   let params = new HttpParams()
  //     .set('id', product.id)
  //     .set('name', product.name ?? '')
  //     .set('description', product.description ?? '')
  //     .set(
  //       'price',
  //       product.price !== null && product.price !== undefined
  //         ? product.price.toString()
  //         : ''
  //     )
  //     .set('status', product.status ?? '')
  //     .set(
  //       'categoryId',
  //       product.categoryId ? product.categoryId.toString() : ''
  //     );
  //   console.log(product, 'product in updateProduct');
  //   console.log(params, 'params in updateProduct');
  //   // Handle additionalAttributes
  //   if (product.additionalAttributes) {
  //     params = params.set(
  //       'additionalAttributes',
  //       JSON.stringify(product.additionalAttributes)
  //     );
  //   }

  //   // Log for debugging (optional)
  //   console.log('additionalAttributes:', product.additionalAttributes);
  //   if (product.additionalAttributes) {
  //     console.log(
  //       'JSON additionalAttributes:',
  //       JSON.stringify(product.additionalAttributes)
  //     );
  //   }
  //   if (product.price !== null && product.price !== undefined) {
  //     console.log('price:', product.price);
  //   }
  //   console.log('product:', product);

  //   // Send PUT request with query params (no body)
  //   return this.http.put<Result>(`${this.baseUrl}/Update`, { params }).pipe(
  //     retry({ count: this.maxRetries, delay: 1000 }),
  //     catchError((error) =>
  //       this.handleError(error, 'updateProduct', { id: product.id })
  //     )
  //   );
  // }
  updateProduct(product: UpdateProduct): Observable<Result> {
    // Client-side validation
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
    // Skip file validation since backend expects query parameters only
    // if (product.mainImage || product.additionalImages || product.imagesToDelete) {
    //   return throwError(
    //     () => new ApiError(400, 'validation', 'File uploads are not supported for this endpoint.')
    //   );
    // }

    // Initialize HttpParams
    let params = new HttpParams()
      .set('Id', product.id.toString())
      .set('Name', product.name ?? '')
      .set('Description', product.description ?? '')
      .set(
        'Price',
        product.price !== null && product.price !== undefined
          ? product.price.toString()
          : ''
      )
      .set('Status', product.status ?? '')
      .set(
        'CategoryId',
        product.categoryId ? product.categoryId.toString() : ''
      );

    // Handle additionalAttributes
    if (product.additionalAttributes) {
      params = params.set(
        'AdditionalAttributes',
        `${product.additionalAttributes}`
      );
    }

    // Handle imagesToDelete
    if (product.imagesToDelete && product.imagesToDelete.length > 0) {
      product.imagesToDelete.forEach((url, index) => {
        params = params.set(`ImagesToDelete[${index}]`, url);
      });
    }

    // Log for debugging
    console.log('Query Parameters:');
    params.keys().forEach((key) => {
      console.log(
        `${key}: ${params.get(key) || params.getAll(key)?.join(', ')}`
      );
    });
    console.log('Product:', product);

    console.log(product.additionalAttributes, 'additionalAttributes');
    console.log(params, 'params in updateProduct');
    // Send PUT request with query params (no body)
    return this.http
      .put<Result>(`${this.baseUrl}/Update`, null, { params })
      .pipe(
        retry({ count: this.maxRetries, delay: 1000 }),
        catchError((error) =>
          this.handleError(error, 'updateProduct', { id: product.id })
        )
      );
  }
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
      retry({ count: this.maxRetries, delay: 1000 }),
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

  private validateMediaFiles(files: File[]): boolean {
    return files.every((file) => {
      const extension = file.name
        .substring(file.name.lastIndexOf('.'))
        .toLowerCase();
      if (this.allowedImageExtensions.includes(extension)) {
        return file.size <= this.maxAllowedImageSize;
      } else if (this.allowedVideoExtensions.includes(extension)) {
        return file.size <= this.maxAllowedVideoSize;
      }
      return false;
    });
  }

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
