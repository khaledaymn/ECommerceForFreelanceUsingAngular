import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductStatus } from '../../../../interfaces/product.interface';
import { Category } from '../../../../interfaces/category';

interface MediaPreview {
  url: string;
  isExisting: boolean;
  mediaType: 'image' | 'video' | 'pdf';
  file?: File;
  mediaPublicId?: string | null;
  originalIndex?: number;
}

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Input() categories: Category[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  @ViewChild('mainImageInput') mainImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('additionalMediaInput')
  additionalMediaInput!: ElementRef<HTMLInputElement>;

  formData = {
    id: null as number | null,
    name: '',
    description: '',
    brand: '',
    model: '',
    status: ProductStatus.Purchase.toString(),
    categoryId: '',
    quantity: 0 as number | 0,
    mainImage: null as File | null,
    additionalMedia: [] as File[],
    additionalAttributes: {} as Record<string, string>,
  };

  mainImagePreview: string | null = null;
  additionalMediaPreviews: MediaPreview[] = [];
  mediaToDelete: string[] = []; // Track deleted media public IDs
  mainImageError: string | null = null;
  additionalMediaError: string | null = null;
  isSubmitting = false;
  isEditingMode = false;
  hasExistingMainImage = false;

  dragOver = false;
  newAttribute = { key: '', value: '' };

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.resetForm();
    }
    if (changes['product']) {
      this.resetForm();
    }
  }

  trackByAttributeKey(
    index: number,
    item: { key: string; value: string }
  ): string {
    return item.key;
  }

  resetForm(): void {
    this.isEditingMode = !!this.product;
    this.hasExistingMainImage = false;
    this.mediaToDelete = []; // Reset mediaToDelete

    if (this.product) {
      this.formData = {
        id: this.product.id || null,
        name: this.product.name || '',
        description: this.product.description || '',
        brand: this.product.brand || '',
        model: this.product.model || '',
        status: this.product.status || ProductStatus.Purchase.toString(),
        categoryId: this.product.categoryId?.toString() || '',
        quantity: this.product.quantity || 0,
        mainImage: null,
        additionalMedia: [],
        additionalAttributes: this.product.additionalAttributes
          ? typeof this.product.additionalAttributes === 'string'
            ? JSON.parse(this.product.additionalAttributes)
            : this.product.additionalAttributes
          : {},
      };
      this.setExistingMainImagePreview();
      this.setExistingAdditionalMediaPreviews();
    } else {
      this.formData = {
        id: null,
        name: '',
        description: '',
        brand: '',
        model: '',
        status: ProductStatus.Purchase.toString(),
        categoryId: '',
        quantity: 0,
        mainImage: null,
        additionalMedia: [],
        additionalAttributes: {},
      };
      this.mainImagePreview = null;
      this.additionalMediaPreviews = [];
      this.hasExistingMainImage = false;
    }

    this.mainImageError = null;
    this.additionalMediaError = null;
    this.isSubmitting = false;
    this.newAttribute = { key: '', value: '' };

    if (this.mainImageInput) {
      this.mainImageInput.nativeElement.value = '';
    }
    if (this.additionalMediaInput) {
      this.additionalMediaInput.nativeElement.value = '';
    }
  }

  private setExistingMainImagePreview(): void {
    if (
      this.product?.mainImageURL &&
      this.product.mainImageURL !== 'null' &&
      this.product.mainImageURL.trim() !== ''
    ) {
      this.mainImagePreview = this.product.mainImageURL;
      this.hasExistingMainImage = true;
    } else {
      this.mainImagePreview = null;
      this.hasExistingMainImage = false;
    }
  }

  private setExistingAdditionalMediaPreviews(): void {
    this.additionalMediaPreviews = [];
    if (this.product?.productMedia && this.product.productMedia.length > 0) {
      this.product.productMedia.forEach((media, index) => {
        if (
          media.mediaURL &&
          media.mediaURL !== 'null' &&
          media.mediaURL.trim() !== '' &&
          ['image', 'video', 'pdf'].includes(media.mediaType || '')
        ) {
          this.additionalMediaPreviews.push({
            url: media.mediaURL,
            isExisting: true,
            mediaType: media.mediaType as 'image' | 'video' | 'pdf',
            mediaPublicId: media.mediaPublicId || null,
            originalIndex: index,
          });
        }
      });
    }
  }

  triggerMainImageInput(): void {
    this.mainImageInput.nativeElement.click();
  }

  triggerAdditionalMediaInput(): void {
    this.additionalMediaInput.nativeElement.click();
  }

  onMainImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.handleMainImageFile(file);
    }
  }

  onAdditionalMediaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    files.forEach((file) => {
      if (this.validateMediaFile(file)) {
        this.handleAdditionalMediaFile(file);
      }
    });
    input.value = ''; // Reset input
  }

  onMainImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.handleMainImageFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  handleMainImageFile(file: File): void {
    if (!this.validateImageFile(file)) return;
    this.formData.mainImage = file;
    this.hasExistingMainImage = false;
    this.mainImageError = null;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.mainImagePreview = e.target?.result as string;
      this.showSuccessFeedback();
    };
    reader.readAsDataURL(file);
  }

  handleAdditionalMediaFile(file: File): void {
    this.formData.additionalMedia.push(file);
    this.additionalMediaError = null;
    const reader = new FileReader();
    reader.onload = (e) => {
      const mediaType = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : 'pdf';
      this.additionalMediaPreviews.push({
        url: e.target?.result as string,
        isExisting: false,
        mediaType,
        file,
        mediaPublicId: null,
        originalIndex: this.additionalMediaPreviews.length,
      });
    };
    reader.readAsDataURL(file);
  }

  removeMainImage(): void {
    this.formData.mainImage = null;
    this.mainImagePreview = null;
    this.hasExistingMainImage = false;
    this.mainImageError = null;
    if (this.mainImageInput) {
      this.mainImageInput.nativeElement.value = '';
    }
  }

  removeAdditionalMedia(index: number): void {
    const preview = this.additionalMediaPreviews[index];
    if (preview.isExisting && preview.mediaPublicId) {
      this.mediaToDelete.push(preview.mediaPublicId);
    }
    this.additionalMediaPreviews.splice(index, 1);
    if (!preview.isExisting && preview.file) {
      const fileIndex = this.formData.additionalMedia.indexOf(preview.file);
      if (fileIndex > -1) {
        this.formData.additionalMedia.splice(fileIndex, 1);
      }
    }
    this.additionalMediaPreviews.forEach((preview, idx) => {
    preview.originalIndex = idx;
  });
  }

  validateImageFile(file: File): boolean {
    const allowedTypes = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/webp',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(file.type)) {
      this.mainImageError = 'نوع الملف غير مدعوم للصورة الرئيسية';
      this.showErrorFeedback();
      return false;
    }
    if (file.size > 3 * 1024 * 1024) {
      this.mainImageError = 'حجم الصورة يجب أن يكون أقل من 3 ميجابايت';
      this.showErrorFeedback();
      return false;
    }
    return true;
  }

  validateMediaFile(file: File): boolean {
    const imageTypes = [
      'image/png',
      'image/jpg',
      'image/jpeg',
      'image/webp',
      'image/svg+xml',
    ];
    const videoTypes = ['video/mp4', 'video/webm', 'video/mov', 'video/mkv'];
    const pdfTypes = ['application/pdf'];
    const allowedVideoExtensions = ['.mp4', '.webm', '.mov', '.mkv'];
    const fileExtension = file.name
      .toLowerCase()
      .slice(file.name.lastIndexOf('.'));
    const isValidVideoExtension =
      allowedVideoExtensions.includes(fileExtension);
    if (imageTypes.includes(file.type)) {
      if (file.size > 3 * 1024 * 1024) {
        this.additionalMediaError = 'حجم الصورة يجب أن يكون أقل من 3 ميجابايت';
        this.showErrorFeedback();
        return false;
      }
      return true;
    } else if (videoTypes.includes(file.type) && isValidVideoExtension) {
      if (file.size > 10 * 1024 * 1024) {
        this.additionalMediaError =
          'حجم الفيديو يجب أن يكون أقل من 10 ميجابايت';
        this.showErrorFeedback();
        return false;
      }
      return true;
    } else if (pdfTypes.includes(file.type)) {
      if (file.size > 5 * 1024 * 1024) {
        this.additionalMediaError = 'حجم ملف PDF يجب أن يكون أقل من 5 ميجابايت';
        this.showErrorFeedback();
        return false;
      }
      return true;
    }
    this.additionalMediaError = `نوع الملف غير مدعوم. ${
      file.type.startsWith('video/')
        ? 'الفيديوهات المسموح بها: .mp4, .webm, .mov, .mkv'
        : ''
    }`;
    this.showErrorFeedback();
    return false;
  }

  private showErrorFeedback(): void {
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
      uploadArea.classList.add('error-state');
      setTimeout(() => uploadArea.classList.remove('error-state'), 2000);
    }
  }

  private showSuccessFeedback(): void {
    const imagePreview = document.querySelector('.image-preview');
    if (imagePreview) {
      imagePreview.classList.add('success-state');
      setTimeout(() => imagePreview.classList.remove('success-state'), 1000);
    }
  }

  isExistingMainImage(): boolean {
    return (
      this.isEditingMode &&
      this.hasExistingMainImage &&
      !this.formData.mainImage
    );
  }

  getImages(): MediaPreview[] {
    return this.additionalMediaPreviews.filter(
      (media) => media.mediaType === 'image'
    );
  }

  getVideos(): MediaPreview[] {
    return this.additionalMediaPreviews.filter(
      (media) => media.mediaType === 'video'
    );
  }

  getPdfs(): MediaPreview[] {
    return this.additionalMediaPreviews.filter(
      (media) => media.mediaType === 'pdf'
    );
  }

  getAttributesArray(): { key: string; value: string }[] {
    return Object.entries(this.formData.additionalAttributes).map(
      ([key, value]) => ({
        key,
        value,
      })
    );
  }

  addAttribute(): void {
    if (this.newAttribute.key.trim() && this.newAttribute.value.trim()) {
      this.formData.additionalAttributes[this.newAttribute.key.trim()] =
        this.newAttribute.value.trim();
      this.newAttribute = { key: '', value: '' };
      this.additionalMediaError = null;
    }
  }

  removeAttribute(key: string): void {
    if (this.formData.additionalAttributes.hasOwnProperty(key)) {
      delete this.formData.additionalAttributes[key];
    }
  }

  onInputFocus(event: FocusEvent): void {
    const parent = (event.target as HTMLElement).closest('.form-group');
    if (parent) {
      this.renderer.addClass(parent, 'focused');
    }
  }

  onInputBlur(event: FocusEvent): void {
    const parent = (event.target as HTMLElement).closest('.form-group');
    if (parent) {
      this.renderer.removeClass(parent, 'focused');
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const submitData = {
      id: this.formData.id || 0,
      name: this.formData.name || '',
      description: this.formData.description || '',
      brand: this.formData.brand || '',
      model: this.formData.model || '',
      status: this.formData.status || ProductStatus.Purchase.toString(),
      categoryId: this.formData.categoryId
        ? Number(this.formData.categoryId)
        : 0,
      quantity: this.formData.quantity || 0,
      mainImage: this.formData.mainImage || null,
      additionalMedia:
        this.formData.additionalMedia.length > 0
          ? this.formData.additionalMedia
          : [],
      mediaToDelete: this.mediaToDelete.length > 0 ? this.mediaToDelete : [],
      additionalAttributes:
        Object.keys(this.formData.additionalAttributes).length > 0
          ? this.formData.additionalAttributes
          : {},
    };
    console.log(submitData.quantity);

    this.save.emit(submitData);
    this.isSubmitting = false;
  }

  onClose(): void {
    this.close.emit();
  }
}
