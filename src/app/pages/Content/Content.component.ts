// src/app/components/site-settings/Content.component.ts

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AdminData {
  id: number;
  title: string;
  description: string;
  logo: string;
  heroImage: string;
}

@Component({
  selector: 'app-Content',
  templateUrl: './Content.component.html',
  styleUrls: ['./Content.component.scss'],
  imports: [CommonModule, FormsModule],
  standalone: true,
})
export class ContentComponent implements OnInit {
  adminData!: AdminData;
  loading = true;
  saving = false;
  validationError: string | null = null;

  // معاينة الصور
  logoPreview: string = '';
  heroPreview: string = '';

  // الفورم
  form = {
    title: '',
    description: '',
    logoFile: null as File | null,
    heroFile: null as File | null,
  };

  // حدود رفع الملفات
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 ميجا بايت
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  private apiUrl = `${environment.apiUrl}/AdminData`;

  constructor(
    private http: HttpClient,
    private notification: NotificationService
  ) {}

  // جلب التوكن وإرجاع الـ headers
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : '',
      }),
    };
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.validationError = null;

    this.http
      .get<AdminData>(`${this.apiUrl}/GetAdminData`, this.getAuthHeaders())
      .subscribe({
        next: (data) => {
          this.adminData = data;
          this.form.title = data.title;
          this.form.description = data.description || '';
          this.logoPreview = data.logo;
          this.heroPreview = data.heroImage;
          this.loading = false;
        },
        error: (err) => {
          if (err.status === 401) {
            this.notification.error(
              'انتهت الجلسة',
              'يرجى تسجيل الدخول مرة أخرى'
            );
          } else {
            this.notification.error('فشل التحميل', 'تعذر تحميل إعدادات الموقع');
          }
          this.loading = false;
        },
      });
  }

  // تحقق من صحة الملف
  private validateFile(file: File): string | null {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return 'نوع الملف غير مدعوم. يُسمح فقط بـ: JPG, PNG, WebP, GIF';
    }
    if (file.size > this.MAX_FILE_SIZE) {
      return `حجم الملف كبير جدًا. الحد الأقصى 5 ميجا بايت (الآن: ${(
        file.size /
        1024 /
        1024
      ).toFixed(1)} ميجا)`;
    }
    return null;
  }

  onLogoSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const error = this.validateFile(file);
    if (error) {
      this.notification.error('الشعار غير صالح', error);
      event.target.value = '';
      return;
    }

    this.form.logoFile = file;
    this.previewImage(file, 'logo');
  }

  onHeroSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    const error = this.validateFile(file);
    if (error) {
      this.notification.error('الصورة الرئيسية غير صالحة', error);
      event.target.value = '';
      return;
    }

    this.form.heroFile = file;
    this.previewImage(file, 'hero');
  }

  previewImage(file: File, type: 'logo' | 'hero') {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'logo') this.logoPreview = e.target?.result as string;
      else this.heroPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveChanges() {
    this.validationError = null;

    // تحقق من العنوان
    if (!this.form.title?.trim()) {
      this.validationError = 'عنوان الموقع مطلوب';
      this.notification.error('مطلوب', this.validationError);
      return;
    }

    // تحقق من الملفات إن وجدت
    if (this.form.logoFile) {
      const logoError = this.validateFile(this.form.logoFile);
      if (logoError) {
        this.validationError = logoError;
        this.notification.error('الشعار', logoError);
        return;
      }
    }

    if (this.form.heroFile) {
      const heroError = this.validateFile(this.form.heroFile);
      if (heroError) {
        this.validationError = heroError;
        this.notification.error('الصورة الرئيسية', heroError);
        return;
      }
    }

    // كل شيء تمام → نبدأ الحفظ
    this.saving = true;

    const formData = new FormData();
    formData.append('Id', '1');
    formData.append('Title', this.form.title.trim());
    formData.append('Description', this.form.description.trim());

    // إرسال ملف أو سلسلة فارغة
    formData.append('Logo', this.form.logoFile || ('' as any));
    formData.append('AboutImage', this.form.heroFile || ('' as any));

    this.http
      .put(`${this.apiUrl}/UpdateAdminData`, formData, this.getAuthHeaders())
      .subscribe({
        next: () => {
          this.notification.success('تم بنجاح', 'تم حفظ إعدادات الموقع');
          this.form.logoFile = null;
          this.form.heroFile = null;
          this.loadData(); // تحديث الصور من السيرفر
          this.saving = false;
        },
        error: (err) => {
          if (err.status === 401) {
            this.notification.error(
              'انتهت الجلسة',
              'يرجى تسجيل الدخول مرة أخرى'
            );
          } else {
            this.notification.error('فشل الحفظ', 'حدث خطأ أثناء حفظ البيانات');
            console.error('Update failed:', err);
          }
          this.saving = false;
        },
      });
  }
}
