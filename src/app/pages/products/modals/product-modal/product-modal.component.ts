import { Component, Input, Output, EventEmitter, type OnInit, type OnChanges } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Product } from "../../../../interfaces/models"
import { Category } from "../../../../interfaces/category"

@Component({
  selector: "app-product-modal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./product-modal.component.html",
  styleUrls: ["./product-modal.component.scss"],
})
export class ProductModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false
  @Input() product: Product | null = null
  @Input() categories: Category[] = []
  @Output() close = new EventEmitter<void>()
  @Output() save = new EventEmitter<any>()

  formData = {
    name: "",
    description: "",
    price: 0,
    status: "متوفر",
    categoryId: "",
    mainImage: null as File | null,
    additionalImages: [] as File[],
    additionalAttributes: {} as Record<string, string>,
  }

  mainImagePreview: string | null = null
  additionalImagePreviews: string[] = []
  mainImageError: string | null = null
  additionalImagesError: string | null = null
  isSubmitting = false

  newAttribute = { key: "", value: "" }

  ngOnInit(): void {
    this.resetForm()
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.resetForm()
    }
  }

  resetForm(): void {
    if (this.product) {
      this.formData = {
        name: this.product.name || "",
        description: this.product.description || "",
        price: this.product.price || 0,
        status: this.product.status || "متوفر",
        categoryId: this.product.categoryId?.toString() || "",
        mainImage: null,
        additionalImages: [],
        additionalAttributes: this.product.additionalAttributes ? JSON.parse(this.product.additionalAttributes) : {},
      }
      this.mainImagePreview = this.product.mainImageUrl || null
      this.additionalImagePreviews = this.product.productImages?.map((img) => img.url || "") || []
    } else {
      this.formData = {
        name: "",
        description: "",
        price: 0,
        status: "متوفر",
        categoryId: "",
        mainImage: null,
        additionalImages: [],
        additionalAttributes: {},
      }
      this.mainImagePreview = null
      this.additionalImagePreviews = []
    }
    this.mainImageError = null
    this.additionalImagesError = null
    this.isSubmitting = false
    this.newAttribute = { key: "", value: "" }
  }

  onMainImageChange(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (file) {
      if (!this.validateImageFile(file)) return

      this.formData.mainImage = file
      this.mainImageError = null

      const reader = new FileReader()
      reader.onload = (e) => {
        this.mainImagePreview = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  onAdditionalImagesChange(event: Event): void {
    const input = event.target as HTMLInputElement
    const files = Array.from(input.files || [])

    const validFiles = files.filter((file) => this.validateMediaFile(file))

    if (validFiles.length !== files.length) {
      this.additionalImagesError = "بعض الملفات غير صالحة"
      return
    }

    this.formData.additionalImages = [...this.formData.additionalImages, ...validFiles]
    this.additionalImagesError = null

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.additionalImagePreviews.push(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    })
  }

  validateImageFile(file: File): boolean {
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      this.mainImageError = "نوع الملف غير مدعوم للصورة الرئيسية"
      return false
    }
    if (file.size > 3 * 1024 * 1024) {
      this.mainImageError = "حجم الصورة يجب أن يكون أقل من 3 ميجابايت"
      return false
    }
    return true
  }

  validateMediaFile(file: File): boolean {
    const imageTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/svg+xml"]
    const videoTypes = ["video/mp4", "video/webm", "video/mov", "video/mkv"]

    if (imageTypes.includes(file.type)) {
      return file.size <= 3 * 1024 * 1024 // 3MB for images
    } else if (videoTypes.includes(file.type)) {
      return file.size <= 10 * 1024 * 1024 // 10MB for videos
    }
    return false
  }

  removeMainImage(): void {
    this.formData.mainImage = null
    this.mainImagePreview = null
    this.mainImageError = null
  }

  removeAdditionalImage(index: number): void {
    this.formData.additionalImages.splice(index, 1)
    this.additionalImagePreviews.splice(index, 1)
  }

  getAttributesArray(): { key: string; value: string }[] {
    return Object.entries(this.formData.additionalAttributes).map(([key, value]) => ({
      key,
      value,
    }))
  }

  addAttribute(): void {
    if (this.newAttribute.key && this.newAttribute.value) {
      this.formData.additionalAttributes[this.newAttribute.key] = this.newAttribute.value
      this.newAttribute = { key: "", value: "" }
    }
  }

  removeAttribute(key: string): void {
    delete this.formData.additionalAttributes[key]
  }

  onSubmit(): void {
    if (this.isSubmitting) return

    this.isSubmitting = true

    const submitData = {
      ...this.formData,
      price: Number(this.formData.price),
      categoryId: Number(this.formData.categoryId),
    }

    // Simulate API call delay
    setTimeout(() => {
      this.save.emit(submitData)
      this.isSubmitting = false
    }, 500)
  }

  onClose(): void {
    this.close.emit()
  }
}
