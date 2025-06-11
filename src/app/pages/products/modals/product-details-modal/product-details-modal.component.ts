import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Product } from "../../../../interfaces/product.interface"
import { Category } from "../../../../interfaces/category"


@Component({
  selector: "app-product-details-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./product-details-modal.component.html",
  styleUrls: ["./product-details-modal.component.scss"],
})
export class ProductDetailsModalComponent {
  @Input() isOpen = false
  @Input() product: Product | null = null
  @Input() categories: Category[] = []
  @Output() close = new EventEmitter<void>()
  @Output() edit = new EventEmitter<Product>()
  @Output() delete = new EventEmitter<Product>()

  showImageZoom = false
  zoomedImageUrl = ""

  onClose(): void {
    this.close.emit()
  }

  onEdit(): void {
    if (this.product) {
      this.edit.emit(this.product)
      this.close.emit()
    }
  }

  onDelete(): void {
    if (this.product) {
      this.delete.emit(this.product)
      this.close.emit()
    }
  }

  openImageZoom(imageUrl?: string): void {
    if (imageUrl) {
      this.zoomedImageUrl = imageUrl
      this.showImageZoom = true
    }
  }

  closeImageZoom(): void {
    this.showImageZoom = false
    this.zoomedImageUrl = ""
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement
    img.style.display = "none"
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("تم نسخ الرابط")
        })
        .catch((err) => {
          console.error("فشل في نسخ الرابط:", err)
        })
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find((cat) => cat.id === categoryId)

    return   category?.name || "غير محدد"
  }

  getStatusClass(status: string): string {
    switch (status) {
      case "متوفر":
        return "status-available"
      case "غير متوفر":
        return "status-unavailable"
      case "قريباً":
        return "status-coming-soon"
      default:
        return "status-default"
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case "متوفر":
        return "متوفر"
      case "غير متوفر":
        return "غير متوفر"
      case "قريباً":
        return "قريباً"
      default:
        return status || "غير محدد"
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return "غير محدد"

    const date = new Date(dateString)
    return date.toLocaleDateString("ar", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  formatPrice(price: number): string {
    if (price === null || price === undefined) return "0.00 ريال"
    return `${price.toFixed(2)} ريال`
  }

  getAdditionalAttributes(): { key: string; value: string }[] {
    if (!this.product?.additionalAttributes) return []

    try {
      const attrs =
        typeof this.product.additionalAttributes === "string"
          ? JSON.parse(this.product.additionalAttributes)
          : this.product.additionalAttributes

      return Object.entries(attrs).map(([key, value]) => ({
        key,
        value: value as string,
      }))
    } catch {
      return []
    }
  }
}
