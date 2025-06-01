import { Component,   OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import {   Router, RouterLink } from "@angular/router"
import {   FormBuilder,   FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
import   { AuthService } from "../../../services/auth.service"

@Component({
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup
  isLoading = false
  errorMessage: string | null = null
  passwordVisible = false
  confirmPasswordVisible = false

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Initialize the form
    this.registerForm = this.fb.group(
      {
        name: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        phone: ["", [Validators.pattern(/^(\+9665|05)[0-9]{8}$/)]],
        company: [""],
        password: ["", [Validators.required, Validators.minLength(8)]],
        passwordConfirmation: ["", [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    )

    // Subscribe to loading and error states
    this.authService.loading$.subscribe((loading) => {
      this.isLoading = loading
    })

    this.authService.error$.subscribe((error) => {
      this.errorMessage = error
    })
  }

  // Custom validator to check if password and confirmation match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get("password")?.value
    const confirmPassword = form.get("passwordConfirmation")?.value

    if (password !== confirmPassword) {
      form.get("passwordConfirmation")?.setErrors({ passwordMismatch: true })
      return { passwordMismatch: true }
    }

    return null
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach((key) => {
        const control = this.registerForm.get(key)
        control?.markAsTouched()
      })
      return
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        // Navigate to dashboard on successful registration
        this.router.navigate(["/"])
      },
      error: (error) => {
        this.errorMessage = error.message
      },
    })
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible
  }

  // Helper methods for form validation
  get name() {
    return this.registerForm.get("name")
  }

  get email() {
    return this.registerForm.get("email")
  }

  get phone() {
    return this.registerForm.get("phone")
  }

  get password() {
    return this.registerForm.get("password")
  }

  get passwordConfirmation() {
    return this.registerForm.get("passwordConfirmation")
  }

  get acceptTerms() {
    return this.registerForm.get("acceptTerms")
  }
}
