// import { Component,   OnInit } from "@angular/core"
// import { CommonModule } from "@angular/common"
// import {   ActivatedRoute,   Router, RouterLink } from "@angular/router"
// import {   FormBuilder,   FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
// import   { AuthService } from "../../../services/auth.service"

// @Component({
//   selector: "app-reset-password",
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterLink],
//   templateUrl: "./reset-password.component.html",
//   styleUrls: ["./reset-password.component.scss"],
// })
// export class ResetPasswordComponent implements OnInit {
//   resetPasswordForm!: FormGroup
//   isLoading = false
//   errorMessage: string | null = null
//   successMessage: string | null = null
//   token: string | null = null
//   passwordVisible = false
//   confirmPasswordVisible = false

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private route: ActivatedRoute,
//     private router: Router,
//   ) {}

//   ngOnInit(): void {
//     // Get token from route params
//     this.token = this.route.snapshot.queryParamMap.get("token")

//     if (!this.token) {
//       this.errorMessage = "رمز إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية"
//     }

//     // Initialize the form
//     this.resetPasswordForm = this.fb.group(
//       {
//         password: ["", [Validators.required, Validators.minLength(8)]],
//         passwordConfirmation: ["", [Validators.required]],
//       },
//       {
//         validators: this.passwordMatchValidator,
//       },
//     )

//     // Subscribe to loading and error states
//     this.authService.loading$.subscribe((loading) => {
//       this.isLoading = loading
//     })

//     this.authService.error$.subscribe((error) => {
//       this.errorMessage = error
//       this.successMessage = null
//     })
//   }

//   // Custom validator to check if password and confirmation match
//   passwordMatchValidator(form: FormGroup) {
//     const password = form.get("password")?.value
//     const confirmPassword = form.get("passwordConfirmation")?.value

//     if (password !== confirmPassword) {
//       form.get("passwordConfirmation")?.setErrors({ passwordMismatch: true })
//       return { passwordMismatch: true }
//     }

//     return null
//   }

//   onSubmit(): void {
//     if (this.resetPasswordForm.invalid || !this.token) {
//       // Mark all fields as touched to trigger validation messages
//       Object.keys(this.resetPasswordForm.controls).forEach((key) => {
//         const control = this.resetPasswordForm.get(key)
//         control?.markAsTouched()
//       })
//       return
//     }

//     const data = {
//       token: this.token,
//       password: this.resetPasswordForm.get("password")?.value,
//       passwordConfirmation: this.resetPasswordForm.get("passwordConfirmation")?.value,
//     }

//     this.authService.resetPassword(data).subscribe({
//       next: () => {
//         this.successMessage = "تم إعادة تعيين كلمة المرور بنجاح"
//         this.errorMessage = null

//         // Redirect to login after 3 seconds
//         setTimeout(() => {
//           this.router.navigate(["/auth/login"])
//         }, 3000)
//       },
//       error: (error) => {
//         this.errorMessage = error.message
//         this.successMessage = null
//       },
//     })
//   }

//   togglePasswordVisibility(): void {
//     this.passwordVisible = !this.passwordVisible
//   }

//   toggleConfirmPasswordVisibility(): void {
//     this.confirmPasswordVisible = !this.confirmPasswordVisible
//   }

//   // Helper methods for form validation
//   get password() {
//     return this.resetPasswordForm.get("password")
//   }

//   get passwordConfirmation() {
//     return this.resetPasswordForm.get("passwordConfirmation")
//   }
// }
