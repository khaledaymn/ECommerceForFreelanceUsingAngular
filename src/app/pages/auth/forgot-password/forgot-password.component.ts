// import { Component,   OnInit } from "@angular/core"
// import { CommonModule } from "@angular/common"
// import { RouterLink } from "@angular/router"
// import {   FormBuilder,   FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
// import   { AuthService } from "../../../services/auth.service"

// @Component({
//   selector: "app-forgot-password",
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterLink],
//   templateUrl: "./forgot-password.component.html",
//   styleUrls: ["./forgot-password.component.scss"],
// })
// export class ForgotPasswordComponent implements OnInit {
//   forgotPasswordForm!: FormGroup
//   isLoading = false
//   errorMessage: string | null = null
//   successMessage: string | null = null

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//   ) {}

//   ngOnInit(): void {
//     // Initialize the form
//     this.forgotPasswordForm = this.fb.group({
//       email: ["", [Validators.required, Validators.email]],
//     })

//     // Subscribe to loading and error states
//     this.authService.loading$.subscribe((loading) => {
//       this.isLoading = loading
//     })

//     this.authService.error$.subscribe((error) => {
//       this.errorMessage = error
//       this.successMessage = null
//     })
//   }

//   onSubmit(): void {
//     if (this.forgotPasswordForm.invalid) {
//       // Mark all fields as touched to trigger validation messages
//       Object.keys(this.forgotPasswordForm.controls).forEach((key) => {
//         const control = this.forgotPasswordForm.get(key)
//         control?.markAsTouched()
//       })
//       return
//     }

//     const email = this.forgotPasswordForm.get("email")?.value

//     this.authService.requestPasswordReset(email).subscribe({
//       next: () => {
//         this.successMessage = "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"
//         this.errorMessage = null
//         this.forgotPasswordForm.reset()
//       },
//       error: (error) => {
//         this.errorMessage = error.message
//         this.successMessage = null
//       },
//     })
//   }

//   // Helper methods for form validation
//   get email() {
//     return this.forgotPasswordForm.get("email")
//   }
// }
