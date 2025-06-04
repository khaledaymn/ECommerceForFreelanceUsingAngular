import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Category } from "../../../../interfaces/category"

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
}
