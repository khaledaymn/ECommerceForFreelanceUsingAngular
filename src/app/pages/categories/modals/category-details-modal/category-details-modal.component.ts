import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import type { Category } from "../../../../interfaces/category"

@Component({
  selector: "app-category-details-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./category-details-modal.component.html",
  styleUrls: ["./category-details-modal.component.scss"],
})
export class CategoryDetailsModalComponent {
  @Input() isOpen = false
  @Input() category: Category | null = null
  @Output() close = new EventEmitter<void>()
  @Output() edit = new EventEmitter<Category>()
  @Output() delete = new EventEmitter<Category>()

  showImageZoom = false

  onClose(): void {
    this.close.emit()
  }

  onEdit(): void {
    if (this.category) {
      this.edit.emit(this.category)
      this.close.emit()
    }
  }

  onDelete(): void {
    if (this.category) {
      this.delete.emit(this.category)
      this.close.emit()
    }
  }

  openImageZoom(): void {
    this.showImageZoom = true
  }

  closeImageZoom(): void {
    this.showImageZoom = false
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement
    img.style.display = "none"
    // Could add fallback image logic here
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          // Could add toast notification here
          console.log("تم نسخ الرابط")
        })
        .catch((err) => {
          console.error("فشل في نسخ الرابط:", err)
        })
    }
  }
}
