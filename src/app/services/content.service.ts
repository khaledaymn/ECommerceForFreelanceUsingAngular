// src/app/services/admin-data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminData } from '../interfaces/content.interface';
// import { AdminData } from '../interfaces/admin-data.interface';

@Injectable({
  providedIn: 'root',
})
export class contentService {
  private readonly apiUrl = `${environment.apiUrl}/AdminData`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : '',
      }),
    };
  }

  /** جلب إعدادات الموقع */
  getAdminData(): Observable<AdminData> {
    return this.http.get<AdminData>(
      `${this.apiUrl}/GetAdminData`,
      this.getAuthHeaders()
    );
  }

  /** تحديث إعدادات الموقع مع دعم رفع الصور */
  updateAdminData(formData: FormData): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/UpdateAdminData`,
      formData,
      this.getAuthHeaders()
    );
  }
}
