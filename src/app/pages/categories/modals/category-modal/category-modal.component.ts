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
  HostListener,
  Renderer2,
} from "@angular/core"
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

  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>

  formData = {
    name: "",
    description: "",
    image: null as File | null,
  }

  imagePreview: string | null = null
  imageError: string | null = null
  isSubmitting = false
  isEditingMode = false
  hasExistingImage = false

  dragOver = false
  inputFocused = false

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    this.resetForm()
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reset form whenever the modal opens or category changes
    if (changes["isOpen"] && this.isOpen) {
      this.resetForm()
    }

    if (changes["category"]) {
      this.resetForm()
    }
  }

  resetForm(): void {
    this.isEditingMode = !!this.category
    this.hasExistingImage = false

    if (this.category) {
      // Set form data
      this.formData = {
        name: this.category.name || "",
        description: this.category.description || "",
        image: null,
      }

      // Handle existing image preview
      this.setExistingImagePreview()
    } else {
      // New category
      this.formData = {
        name: "",
        description: "",
        image: null,
      }
      this.imagePreview = null
      this.hasExistingImage = false
    }

    this.imageError = null
    this.isSubmitting = false

    // Reset file input if it exists
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ""
    }
  }

  private setExistingImagePreview(): void {
    console.log(this.category);
    
    // Try different image URL properties in order of preference
    const possibleimageURLs = [this.category?.imageURL, this.category?.imageThumbnailURL].filter(
      (url) => url && url !== "null" && url.trim() !== "",
    )
    console.log(possibleimageURLs);
    
    if (possibleimageURLs.length > 0) {
      this.imagePreview = possibleimageURLs[0]!
      this.hasExistingImage = true
      // console.log("Setting existing image preview:", this.imagePreview)
    } else {
      this.imagePreview = null
      this.hasExistingImage = false
      // console.log("No existing image found for category:", this.category)
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click()
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    if (file) {
      this.handleImageFile(file)
    }
  }

  removeImage(): void {
    this.formData.image = null
    this.imagePreview = null
    this.hasExistingImage = false
    this.imageError = null

    if (this.fileInput) {
      this.fileInput.nativeElement.value = ""
    }
  }

  onSubmit(): void {
    if (this.isSubmitting) return

    this.isSubmitting = true

    // Prepare form data for submission
    const submitData = {
      ...this.formData,
      // Include flag to indicate if we're removing an existing image
      removeExistingImage: this.isEditingMode && !this.hasExistingImage && !this.formData.image,
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

  @HostListener("dragover", ["$event"])
  onDragOver(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.dragOver = true
  }

  @HostListener("dragleave", ["$event"])
  onDragLeave(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.dragOver = false
  }

  @HostListener("drop", ["$event"])
  onDrop(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.dragOver = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      const file = files[0]
      this.handleImageFile(file)
    }
  }

  onInputFocus(event: FocusEvent): void {
    const parent = (event.target as HTMLElement).closest(".form-group")
    if (parent) {
      this.renderer.addClass(parent, "focused")
      this.inputFocused = true
    }
  }

  onInputBlur(event: FocusEvent): void {
    const parent = (event.target as HTMLElement).closest(".form-group")
    if (parent) {
      this.renderer.removeClass(parent, "focused")
      this.inputFocused = false
    }
  }

  handleImageFile(file: File): void {
    // Validate file type
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      this.imageError = "نوع الملف غير مدعوم. الأنواع المسموحة: PNG, JPG, JPEG, WebP, SVG"
      this.showErrorFeedback()
      return
    }

    // Validate file size (3MB)
    if (file.size > 3 * 1024 * 1024) {
      this.imageError = "حجم الملف يجب أن يكون أقل من 3 ميجابايت"
      this.showErrorFeedback()
      return
    }

    this.formData.image = file
    this.hasExistingImage = false // Now we have a new image
    this.imageError = null

    // Create preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      this.imagePreview = e.target?.result as string
      // Add a small delay to show the preview animation
      setTimeout(() => {
        this.showSuccessFeedback()
      }, 100)
    }
    reader.readAsDataURL(file)
  }

  private showErrorFeedback(): void {
    // Add visual feedback for error
    const uploadArea = document.querySelector(".upload-area")
    if (uploadArea) {
      uploadArea.classList.add("error-state")
      setTimeout(() => {
        uploadArea.classList.remove("error-state")
      }, 2000)
    }
  }

  private showSuccessFeedback(): void {
    // Add visual feedback for success
    const imagePreview = document.querySelector(".image-preview")
    if (imagePreview) {
      imagePreview.classList.add("success-state")
      setTimeout(() => {
        imagePreview.classList.remove("success-state")
      }, 1000)
    }
  }

  // Check if current preview is from existing category (not newly uploaded)
  isExistingImage(): boolean {
    return this.isEditingMode && this.hasExistingImage && !this.formData.image
  }

  // Check if we have any image to display
  hasImageToDisplay(): boolean {
    
    return !!this.imagePreview
  }

  // Get the appropriate image source
  getImageSource(): string {
    return this.imagePreview || ""
  }

  // Handle image load error
  onImageError(event: Event): void {
    console.error("Failed to load image:", this.imagePreview)
    const img = event.target as HTMLImageElement

    // If this was an existing image that failed to load, show upload area instead
    if (this.isExistingImage()) {
      this.imagePreview = null
      this.hasExistingImage = false
      this.imageError = "فشل في تحميل الصورة الموجودة"
    }
  }
}
