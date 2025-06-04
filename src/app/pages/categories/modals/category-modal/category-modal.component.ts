import { Component, Input, Output, EventEmitter, type OnInit, type OnChanges } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Category } from "../../../../interfaces/category"

@Component({
  selector: "app-category-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./category-modal.component.html",
  styleUrls: ["./category-modal.component.scss"],
})
export class CategoryModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false
  @Input() category: Category | null = null
  @Output() close = new EventEmitter<void>()
  @Output() save = new EventEmitter<any>()

  formData = {
    name: "",
    description: "",
    image: null as File | null,
  }

  imagePreview: string | null = null
  imageError: string | null = null
  isSubmitting = false

  ngOnInit(): void {
    this.resetForm()
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.resetForm()
    }
  }

  resetForm(): void {
    if (this.category) {
      this.formData = {
        name: this.category.name || "",
        description: this.category.description || "",
        image: null,
      }
      this.imagePreview = this.category.imageUrl || null
    } else {
      this.formData = {
        name: "",
        description: "",
        image: null,
      }
      this.imagePreview = null
    }
    this.imageError = null
    this.isSubmitting = false
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (file) {
      // Validate file type
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/svg+xml"]
      if (!allowedTypes.includes(file.type)) {
        this.imageError = "نوع الملف غير مدعوم. الأنواع المسموحة: PNG, JPG, JPEG, WebP, SVG"
        return
      }

      // Validate file size (3MB)
      if (file.size > 3 * 1024 * 1024) {
        this.imageError = "حجم الملف يجب أن يكون أقل من 3 ميجابايت"
        return
      }

      this.formData.image = file
      this.imageError = null

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  removeImage(): void {
    this.formData.image = null
    this.imagePreview = null
    this.imageError = null
  }

  onSubmit(): void {
    if (this.isSubmitting) return

    this.isSubmitting = true

    // Simulate API call delay
    setTimeout(() => {
      this.save.emit(this.formData)
      this.isSubmitting = false
    }, 500)
  }

  onClose(): void {
    this.close.emit()
  }
}
