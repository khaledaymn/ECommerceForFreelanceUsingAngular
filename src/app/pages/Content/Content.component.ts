// src/app/components/site-settings/Content.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { contentService } from '../../services/admin-data.service';
import { NotificationService } from '../../services/notification.service';
import { AdminData } from '../../interfaces/content.interface';
import { contentService } from '../../services/content.service';
// import { AdminData } from '../../interfaces/admin-data.interface';

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

  logoPreview = '';
  heroPreview = '';

  form = {
    title: '',
    description: '',
    logoFile: null as File | null,
    heroFile: null as File | null,
  };

  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  constructor(
    private contentService: contentService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.validationError = null;

    this.contentService.getAdminData().subscribe({
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
          this.notification.error('انتهت الجلسة', 'يرجى تسجيل الدخول مرة أخرى');
        } else {
          this.notification.error('فشل التحميل', 'تعذر جلب إعدادات الموقع');
        }
        this.loading = false;
      },
    });
  }

  private validateFile(file: File): string | null {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return 'نوع الملف غير مدعوم (JPG, PNG, WebP, GIF فقط)';
    }
    if (file.size > this.MAX_FILE_SIZE) {
      return `حجم الملف كبير جدًا (الحد الأقصى 5 ميجا)`;
    }
    return null;
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const error = this.validateFile(file);
    if (error) {
      this.notification.error('الشعار', error);
      event.target.value = '';
      return;
    }

    this.form.logoFile = file;
    this.previewImage(file, 'logo');
  }

  onHeroSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const error = this.validateFile(file);
    if (error) {
      this.notification.error('الصورة الرئيسية', error);
      event.target.value = '';
      return;
    }

    this.form.heroFile = file;
    this.previewImage(file, 'hero');
  }

  previewImage(file: File, type: 'logo' | 'hero') {
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'logo') this.logoPreview = reader.result as string;
      else this.heroPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveChanges() {
    this.validationError = null;

    if (!this.form.title?.trim()) {
      this.validationError = 'عنوان الموقع مطلوب';
      this.notification.error('مطلوب', this.validationError);
      return;
    }

    if (this.form.logoFile && this.validateFile(this.form.logoFile)) {
      this.notification.error('الشعار', this.validateFile(this.form.logoFile)!);
      return;
    }

    if (this.form.heroFile && this.validateFile(this.form.heroFile)) {
      this.notification.error(
        'الصورة الرئيسية',
        this.validateFile(this.form.heroFile)!
      );
      return;
    }

    this.saving = true;

    const formData = new FormData();
    formData.append('Id', '1');
    formData.append('Title', this.form.title.trim());
    formData.append('Description', this.form.description.trim());

    formData.append('Logo', this.form.logoFile || ('' as any));
    formData.append('AboutImage', this.form.heroFile || ('' as any));

    this.contentService.updateAdminData(formData).subscribe({
      next: () => {
        this.notification.success('تم بنجاح', 'تم تحديث إعدادات الموقع');
        this.form.logoFile = null;
        this.form.heroFile = null;
        this.loadData();
        this.saving = false;
      },
      error: (err) => {
        if (err.status === 401) {
          this.notification.error('انتهت الجلسة', 'يرجى تسجيل الدخول مرة أخرى');
        } else {
          this.notification.error('فشل الحفظ', 'حدث خطأ أثناء حفظ البيانات');
        }
        this.saving = false;
      },
    });
  }
}
