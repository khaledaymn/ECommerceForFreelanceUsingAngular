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
import { Product } from '../../../../interfaces/product.interface';
import { Category } from '../../../../interfaces/category';

interface ImagePreview {
  url: string;
  isExisting: boolean;
  isVideo: boolean;
  file?: File;
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
  @ViewChild('additionalImagesInput')
  additionalImagesInput!: ElementRef<HTMLInputElement>;

  formData = {
    id: null as number | null,
    name: '',
    description: '',
    price: 0,
    status: 'متوفر',
    categoryId: '',
    mainImage: null as File | null,
    additionalImages: [] as File[],
    additionalAttributes: {} as Record<string, string>,
  };

  mainImagePreview: string | null = null;
  additionalImagePreviews: ImagePreview[] = [];
  mainImageError: string | null = null;
  additionalImagesError: string | null = null;
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

    if (this.product) {
      this.formData = {
        id: this.product.id || null,
        name: this.product.name || '',
        description: this.product.description || '',
        price: this.product.price || 0,
        status: this.product.status || 'متوفر',
        categoryId: this.product.categoryId?.toString() || '',
        mainImage: null,
        additionalImages: [],
        additionalAttributes: this.product.additionalAttributes
          ? typeof this.product.additionalAttributes === 'string'
            ? JSON.parse(this.product.additionalAttributes)
            : this.product.additionalAttributes
          : {},
      };

      // Handle existing main image
      this.setExistingMainImagePreview();

      // Handle existing additional images
      this.setExistingAdditionalImagePreviews();
    } else {
      this.formData = {
        id: null,
        name: '',
        description: '',
        price: 0,
        status: 'متوفر',
        categoryId: '',
        mainImage: null,
        additionalImages: [],
        additionalAttributes: {},
      };
      this.mainImagePreview = null;
      this.additionalImagePreviews = [];
      this.hasExistingMainImage = false;
    }

    this.mainImageError = null;
    this.additionalImagesError = null;
    this.isSubmitting = false;
    this.newAttribute = { key: '', value: '' };

    // Reset file inputs
    if (this.mainImageInput) {
      this.mainImageInput.nativeElement.value = '';
    }
    if (this.additionalImagesInput) {
      this.additionalImagesInput.nativeElement.value = '';
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

  private setExistingAdditionalImagePreviews(): void {
    this.additionalImagePreviews = [];

    if (this.product?.productImages && this.product.productImages.length > 0) {
      this.product.productImages.forEach((image) => {
        if (
          image.mediaURL &&
          image.mediaURL !== 'null' &&
          image.mediaURL.trim() !== ''
        ) {
          this.additionalImagePreviews.push({
            url: image.mediaURL,
            isExisting: true,
            isVideo: image.mediaType === 'video',
          });
        }
      });
    }
  }

  triggerMainImageInput(): void {
    this.mainImageInput.nativeElement.click();
  }

  triggerAdditionalImagesInput(): void {
    this.additionalImagesInput.nativeElement.click();
  }

  onMainImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.handleMainImageFile(file);
    }
  }

  onAdditionalImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    files.forEach((file) => {
      if (this.validateMediaFile(file)) {
        this.handleAdditionalImageFile(file);
      }
    });

    // Reset input
    input.value = '';
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

  handleAdditionalImageFile(file: File): void {
    this.formData.additionalImages.push(file);
    this.additionalImagesError = null;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.additionalImagePreviews.push({
        url: e.target?.result as string,
        isExisting: false,
        isVideo: file.type.startsWith('video/'),
        file: file,
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

  removeAdditionalImage(index: number): void {
    const preview = this.additionalImagePreviews[index];

    // Remove from preview array
    this.additionalImagePreviews.splice(index, 1);

    // If it's a new file, remove from formData.additionalImages
    if (!preview.isExisting && preview.file) {
      const fileIndex = this.formData.additionalImages.indexOf(preview.file);
      if (fileIndex > -1) {
        this.formData.additionalImages.splice(fileIndex, 1);
      }
    }
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

    if (imageTypes.includes(file.type)) {
      if (file.size > 3 * 1024 * 1024) {
        this.additionalImagesError = 'حجم الصورة يجب أن يكون أقل من 3 ميجابايت';
        return false;
      }
      return true;
    } else if (videoTypes.includes(file.type)) {
      if (file.size > 10 * 1024 * 1024) {
        this.additionalImagesError =
          'حجم الفيديو يجب أن يكون أقل من 10 ميجابايت';
        return false;
      }
      return true;
    }

    this.additionalImagesError = 'نوع الملف غير مدعوم';
    return false;
  }

  private showErrorFeedback(): void {
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
      uploadArea.classList.add('error-state');
      setTimeout(() => {
        uploadArea.classList.remove('error-state');
      }, 2000);
    }
  }

  private showSuccessFeedback(): void {
    const imagePreview = document.querySelector('.image-preview');
    if (imagePreview) {
      imagePreview.classList.add('success-state');
      setTimeout(() => {
        imagePreview.classList.remove('success-state');
      }, 1000);
    }
  }

  isExistingMainImage(): boolean {
    return (
      this.isEditingMode &&
      this.hasExistingMainImage &&
      !this.formData.mainImage
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
      // Check if key already exists
      if (
        this.formData.additionalAttributes.hasOwnProperty(
          this.newAttribute.key.trim()
        )
      ) {
        // Update existing attribute
        this.formData.additionalAttributes[this.newAttribute.key.trim()] =
          this.newAttribute.value.trim();
        console.log(
          `Updated existing attribute: ${this.newAttribute.key.trim()} = ${this.newAttribute.value.trim()}`
        );
      } else {
        // Add new attribute
        this.formData.additionalAttributes[this.newAttribute.key.trim()] =
          this.newAttribute.value.trim();
        console.log(
          `Added new attribute: ${this.newAttribute.key.trim()} = ${this.newAttribute.value.trim()}`
        );
      }

      // Reset the form
      this.newAttribute = { key: '', value: '' };

      // Clear any previous errors
      this.additionalImagesError = null;
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

  // onSubmit(): void {
  //   if (this.isSubmitting) return;

  //   this.isSubmitting = true;

  //   const submitData = {
  //     ...this.formData,
  //     id: this.formData.id || null,
  //     price: Number(this.formData.price),
  //     categoryId: Number(this.formData.categoryId),
  //     additionalAttributes: JSON.stringify(this.formData.additionalAttributes),
  //     removeExistingMainImage:
  //       this.isEditingMode &&
  //       !this.hasExistingMainImage &&
  //       !this.formData.mainImage,
  //   };
  //   console.log('Submitting product data:', submitData);
  //   console.log(
  //     submitData.additionalAttributes,
  //     'as JSON string:',
  //     JSON.stringify(submitData.additionalAttributes)
  //   );
  //   console.log('formData:', this.formData);
  //   console.log(
  //     'formData.additionalAttributes:',
  //     this.formData.additionalAttributes
  //   );

  //   setTimeout(() => {
  //     this.save.emit(submitData);
  //     this.isSubmitting = false;
  //   }, 500);
  // }

  onSubmit(): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    const submitData = {
      ...this.formData,
      id: this.product?.id || 0, // Ensure id is included and not overwritten
      price: Number(this.formData.price),
      categoryId: Number(this.formData.categoryId),
      additionalAttributes: this.formData.additionalAttributes, // Pass as object, let service handle JSON
      removeExistingMainImage:
        this.isEditingMode &&
        !this.hasExistingMainImage &&
        !this.formData.mainImage,
      imagesToDelete: this.additionalImagePreviews
        .filter((img) => img.isExisting)
        .map((img) => img.url), // Include URLs of existing images to delete
    };

    console.log('Submitting product data:', submitData);

    setTimeout(() => {
      this.save.emit(submitData);
      this.isSubmitting = false;
    }, 500);
  }

  onClose(): void {
    this.close.emit();
  }
}
