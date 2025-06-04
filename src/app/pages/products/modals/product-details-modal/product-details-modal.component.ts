import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Product } from "../../../../interfaces/models"

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
  @Output() close = new EventEmitter<void>()
  @Output() edit = new EventEmitter<Product>()
  @Output() delete = new EventEmitter<Product>()

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

  getStatusClass(status: string): string {
    switch (status) {
      case "متوفر":
        return "bg-green-100 text-green-800"
      case "غير متوفر":
        return "bg-red-100 text-red-800"
      case "قريباً":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  getAdditionalAttributes(): { key: string; value: string }[] {
    if (!this.product?.additionalAttributes) return []

    try {
      const attrs = JSON.parse(this.product.additionalAttributes)
      return Object.entries(attrs).map(([key, value]) => ({
        key,
        value: value as string,
      }))
    } catch {
      return []
    }
  }
}
