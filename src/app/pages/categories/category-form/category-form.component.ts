import {
  Component,
  EventEmitter,
  Input,
  Output,
 OnInit,
 OnDestroy,
 OnChanges,
 SimpleChanges,
  ViewChild,
 ElementRef,
} from "@angular/core"
import { FormsModule, NgForm } from "@angular/forms"
import { Subject, takeUntil } from "rxjs"
import { animate, style, transition, trigger } from "@angular/animations"
import { AddCategoryDTO, Category, UpdateCategoryDTO } from "../../../interfaces/category"
import { CategoryService } from "../../../services/category.service"
import { ResultDTO } from "../../../interfaces/product.interface"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-category-form",
  imports:[FormsModule,CommonModule],
  templateUrl: "./category-form.component.html",
  styleUrls: ["./category-form.component.scss"],
  animations: [
    trigger("modalAnimation", [
      transition(":enter", [
        style({ opacity: 0, transform: "scale(0.8)" }),
        animate("300ms cubic-bezier(0.4, 0, 0.2, 1)", style({ opacity: 1, transform: "scale(1)" })),
      ]),
      transition(":leave", [
        animate("200ms cubic-bezier(0.4, 0, 0.2, 1)", style({ opacity: 0, transform: "scale(0.8)" })),
      ]),
    ]),
    trigger("backdropAnimation", [
      transition(":enter", [style({ opacity: 0 }), animate("200ms ease-out", style({ opacity: 1 }))]),
      transition(":leave", [animate("200ms ease-out", style({ opacity: 0 }))]),
    ]),
  ],
})
export class CategoryFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false
  @Input() mode: "add" | "edit" = "add"
  @Input() categoryToEdit: Category | null = null
  @Output() close = new EventEmitter<void>()
  @Output() categoryAdded = new EventEmitter<void>()
  @Output() categoryUpdated = new EventEmitter<void>()

  @ViewChild("categoryForm") categoryForm!: NgForm
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>
  @ViewChild("imagePreview") imagePreview!: ElementRef<HTMLImageElement>

  private destroy$ = new Subject<void>()

  categoryData: AddCategoryDTO | UpdateCategoryDTO = {
    name: "",
    description: "",
  }

  selectedFile: File | null = null
  imagePreviewUrl: string | null = null
  isSubmitting = false
  errors: { [key: string]: string } = {}
  hasImageChanged = false

  // Form validation
  nameMinLength = 2
  nameMaxLength = 100
  descriptionMaxLength = 500
  maxFileSize = 5 * 1024 * 1024 // 5MB
  allowedFileTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    // Handle escape key
    document.addEventListener("keydown", this.handleEscapeKey.bind(this))
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
    document.removeEventListener("keydown", this.handleEscapeKey.bind(this))
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["isOpen"] && changes["isOpen"].currentValue) {
      this.initializeForm()
    }

    if (changes["categoryToEdit"] && changes["categoryToEdit"].currentValue) {
      this.loadCategoryData()
    }

    if (changes["mode"]) {
      this.initializeForm()
    }
  }

  initializeForm() {
    if (this.mode === "edit" && this.categoryToEdit) {
      this.loadCategoryData()
    } else {
      this.resetForm()
    }
  }

  loadCategoryData() {
    if (!this.categoryToEdit) return

    this.categoryData = {
      id: this.categoryToEdit.id,
      name: this.categoryToEdit.name,
      description: this.categoryToEdit.description || "",
    }

    // Load existing image if available
    if (this.categoryToEdit.imageURL) {
      this.imagePreviewUrl = this.categoryToEdit.imageURL
      this.hasImageChanged = false
    } else {
      this.imagePreviewUrl = null
      this.hasImageChanged = false
    }

    this.selectedFile = null
    this.errors = {}
  }

  get modalTitle(): string {
    return this.mode === "edit" ? "تعديل الفئة" : "إضافة فئة جديدة"
  }

  get submitButtonText(): string {
    if (this.isSubmitting) {
      return this.mode === "edit" ? "جاري التحديث..." : "جاري الإضافة..."
    }
    return this.mode === "edit" ? "تحديث الفئة" : "إضافة الفئة"
  }

  get submitButtonIcon(): string {
    return this.mode === "edit" ? "edit" : "add"
  }

  handleEscapeKey(event: KeyboardEvent) {
    if (event.key === "Escape" && this.isOpen) {
      this.closeModal()
    }
  }

  closeModal() {
    if (this.isSubmitting) return

    this.resetForm()
    this.close.emit()
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal()
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (!file) {
      this.clearImage()
      return
    }

    // Validate file
    const validation = this.validateFile(file)
    if (!validation.isValid) {
      this.errors["image"] = validation.error!
      this.clearImage()
      return
    }

    this.selectedFile = file
    this.hasImageChanged = true
    this.errors["image"] = ""

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      this.imagePreviewUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  clearImage() {
    this.selectedFile = null
    this.hasImageChanged = true
    this.imagePreviewUrl = null
    this.errors["image"] = ""

    if (this.fileInput) {
      this.fileInput.nativeElement.value = ""
    }
  }

  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `حجم الملف يجب أن يكون أقل من ${this.maxFileSize / (1024 * 1024)}MB`,
      }
    }

    // Check file type
    if (!this.allowedFileTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "نوع الملف غير مدعوم. يرجى اختيار صورة (JPEG, PNG, GIF, WebP)",
      }
    }

    return { isValid: true }
  }

  validateForm(): boolean {
    this.errors = {}
    let isValid = true

    // Validate name
    if (!this.categoryData.name?.trim()) {
      this.errors["name"] = "اسم الفئة مطلوب"
      isValid = false
    } else if (this.categoryData.name.trim().length < this.nameMinLength) {
      this.errors["name"] = `اسم الفئة يجب أن يكون ${this.nameMinLength} أحرف على الأقل`
      isValid = false
    } else if (this.categoryData.name.trim().length > this.nameMaxLength) {
      this.errors["name"] = `اسم الفئة يجب أن يكون ${this.nameMaxLength} حرف كحد أقصى`
      isValid = false
    }

    // Validate description (optional)
    if (this.categoryData.description && this.categoryData.description.trim().length > this.descriptionMaxLength) {
      this.errors["description"] = `الوصف يجب أن يكون ${this.descriptionMaxLength} حرف كحد أقصى`
      isValid = false
    }

    return isValid
  }

  onSubmit() {
    if (this.isSubmitting) return

    // Validate form
    if (!this.validateForm()) {
      return
    }

    this.isSubmitting = true

    if (this.mode === "edit") {
      this.updateCategory()
    } else {
      this.addCategory()
    }
  }

  addCategory() {
    const formData: AddCategoryDTO = {
      name: this.categoryData.name!.trim(),
      description: this.categoryData.description?.trim() || undefined,
      image: this.selectedFile || undefined,
    }
    console.log(formData);

    this.categoryService
      .addCategory(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ResultDTO) => {
          this.isSubmitting = false

          if (result.isSuccess) {
            this.showSuccessMessage("تم إضافة الفئة بنجاح")
            this.categoryAdded.emit()
            this.closeModal()
          } else {
            this.showErrorMessage(result.message || "حدث خطأ أثناء إضافة الفئة")
          }
        },
        error: (error) => {
          this.isSubmitting = false
          this.handleApiError(error, "حدث خطأ أثناء إضافة الفئة. يرجى المحاولة مرة أخرى")
        },
      })
  }

  updateCategory() {
    if (!this.categoryToEdit) return

    const formData: UpdateCategoryDTO = {
      id: this.categoryToEdit.id,
      name: this.categoryData.name!.trim(),
      description: this.categoryData.description?.trim() || undefined,
    }

    // Only include image if it has changed
    if (this.hasImageChanged) {
      formData.image = this.selectedFile || undefined
    }
    console.log(formData);

    this.categoryService
      .updateCategory(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result: ResultDTO) => {
          this.isSubmitting = false

          if (result.isSuccess) {
            this.showSuccessMessage("تم تحديث الفئة بنجاح")
            this.categoryUpdated.emit()
            this.closeModal()
          } else {
            this.showErrorMessage(result.message || "حدث خطأ أثناء تحديث الفئة")
          }
        },
        error: (error) => {
          this.isSubmitting = false
          this.handleApiError(error, "حدث خطأ أثناء تحديث الفئة. يرجى المحاولة مرة أخرى")
        },
      })
  }

  handleApiError(error: any, defaultMessage: string) {
    console.error("API Error:", error)

    if (error.status === 400 && error.error?.errors) {
      // Handle validation errors from server
      const serverErrors = error.error.errors
      Object.keys(serverErrors).forEach((key) => {
        const fieldName = key.toLowerCase()
        this.errors[fieldName] = serverErrors[key][0]
      })
    } else {
      this.showErrorMessage(defaultMessage)
    }
  }

  resetForm() {
    this.categoryData = {
      name: "",
      description: "",
    }
    this.clearImage()
    this.errors = {}
    this.isSubmitting = false
    this.hasImageChanged = false

    if (this.categoryForm) {
      this.categoryForm.resetForm()
    }
  }

  // Helper methods for character counting
  getNameCharacterCount(): number {
    return this.categoryData.name?.length || 0
  }

  getDescriptionCharacterCount(): number {
    return this.categoryData.description?.length || 0
  }

  // Helper methods for validation states
  isFieldInvalid(fieldName: string): boolean {
    return !!this.errors[fieldName]
  }

  getFieldError(fieldName: string): string {
    return this.errors[fieldName] || ""
  }

  // Notification methods (you can integrate with your toast service)
  private showSuccessMessage(message: string) {
    console.log("Success:", message)
    // Implement toast notification here
  }

  private showErrorMessage(message: string) {
    console.log("Error:", message)
    // Implement toast notification here
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click()
  }

  // Check if form has changes (for edit mode)
  hasFormChanges(): boolean {
    if (this.mode === "add") return true

    if (!this.categoryToEdit) return false

    const nameChanged = this.categoryData.name?.trim() !== this.categoryToEdit.name
    const descriptionChanged = (this.categoryData.description?.trim() || "") !== (this.categoryToEdit.description || "")

    return nameChanged || descriptionChanged || this.hasImageChanged
  }

  // Check if submit button should be disabled
  isSubmitDisabled(): boolean {
    const hasValidationErrors = Object.keys(this.errors).length > 0
    const isFormInvalid = !this.categoryForm?.valid
    const hasNoChanges = this.mode === "edit" && !this.hasFormChanges()

    return this.isSubmitting || hasValidationErrors || isFormInvalid || hasNoChanges
  }
}
