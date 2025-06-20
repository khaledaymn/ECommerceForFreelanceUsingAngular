import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Product,
  ProductMedia,
  ProductStatus,
} from '../../../../interfaces/product.interface';
import { Category } from '../../../../interfaces/category';
import { ProductService } from '../../../../services/product.service';

@Component({
  selector: 'app-product-details-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details-modal.component.html',
  styleUrls: ['./product-details-modal.component.scss'],
})
export class ProductDetailsModalComponent implements OnInit {
  constructor(private productService: ProductService) {}
  ngOnInit(): void {
    if (this.product) {
      this.productById = this.product.id;
    } else {
      this.productById = null;
    }
    if (this.productById) {
      this.fetchProductById(this.productById);
    }
  }
  @Input() isOpen = false;
  @Input() product!: Product;
  @Input() categories: Category[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<Product>();
  productById: number | null = null;
  showImageZoom = false;
  zoomedImageUrl = '';

  // Method to fetch product by ID
  fetchProductById(id: number): void {
    this.productService.readProductById(id).subscribe({
      next: (product) => {
        this.product = product;
      },
      error: (err) => {
        console.error('Error fetching product by ID:', err);
      },
    });
  }
  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.product) {
      this.edit.emit(this.product);
      this.close.emit();
    }
  }

  onDelete(): void {
    if (this.product) {
      this.delete.emit(this.product);
      this.close.emit();
    }
  }

  openImageZoom(imageUrl?: string): void {
    if (imageUrl) {
      this.zoomedImageUrl = imageUrl;
      this.showImageZoom = true;
    }
  }

  closeImageZoom(): void {
    this.showImageZoom = false;
    this.zoomedImageUrl = '';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log('تم نسخ الرابط');
        })
        .catch((err) => {
          console.error('فشل في نسخ الرابط:', err);
        });
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((cat) => cat.id === categoryId);

    return category?.name || 'غير محدد';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case ProductStatus.Purchase.toString():
        return 'status-purchase';
      case ProductStatus.Rent.toString():
        return 'status-rent';
      case ProductStatus.RentAndPurchase.toString():
        return 'status-rent-and-purchase';
      default:
        return 'status-default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case ProductStatus.Purchase.toString():
        return ProductStatus.Purchase.toString();
      case ProductStatus.Rent.toString():
        return ProductStatus.Rent.toString();
      case ProductStatus.RentAndPurchase.toString():
        return ProductStatus.RentAndPurchase.toString();
      default:
        return status || 'غير محدد';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'غير محدد';

    const date = new Date(dateString);
    return date.toLocaleDateString('ar', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatPrice(price: number): string {
    if (price === null || price === undefined) return '0.00 ريال';
    return `${price.toFixed(2)} ريال`;
  }

  getAdditionalAttributes(): { key: string; value: string }[] {
    if (!this.product?.additionalAttributes) return [];

    try {
      const attrs =
        typeof this.product.additionalAttributes === 'string'
          ? JSON.parse(this.product.additionalAttributes)
          : this.product.additionalAttributes;

      return Object.entries(attrs).map(([key, value]) => ({
        key,
        value: value as string,
      }));
    } catch {
      return [];
    }
  }
  getImages(): ProductMedia[] {
    return (
      this.product.productMedia?.filter(
        (media) => media.mediaType === 'image'
      ) || []
    );
  }

  getVideos(): any[] {
    return (
      this.product?.productMedia?.filter(
        (media) => media.mediaType === 'video'
      ) || []
    );
  }

  getPdfs(): any[] {
    return (
      this.product?.productMedia?.filter(
        (media) => media.mediaType === 'pdf'
      ) || []
    );
  }
}
