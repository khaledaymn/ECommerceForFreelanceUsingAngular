// import { Component,   OnInit } from "@angular/core"
// import { CommonModule } from "@angular/common"
// import {   Router, RouterLink } from "@angular/router"
// import {   FormBuilder,   FormGroup, Validators, ReactiveFormsModule } from "@angular/forms"
// import   { AuthService } from "../../../services/auth.service"

// @Component({
//   selector: "app-login",
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, RouterLink],
//   templateUrl: "./login.component.html",
//   styleUrls: ["./login.component.scss"],
// })
// export class LoginComponent implements OnInit {
//   loginForm!: FormGroup
//   isLoading = false
//   errorMessage: string | null = null
//   passwordVisible = false

//   constructor(
//     private fb: FormBuilder,
//     private authService: AuthService,
//     private router: Router,
//   ) {}

//   ngOnInit(): void {
//     // Initialize the form
//     this.loginForm = this.fb.group({
//       email: ["", [Validators.required, Validators.email]],
//       password: ["", [Validators.required, Validators.minLength(6)]],
//       rememberMe: [false],
//     })

//     // Subscribe to loading and error states
//     this.authService.loading$.subscribe((loading) => {
//       this.isLoading = loading
//     })

//     this.authService.error$.subscribe((error) => {
//       this.errorMessage = error
//     })
//   }

//   onSubmit(): void {
//     if (this.loginForm.invalid) {
//       // Mark all fields as touched to trigger validation messages
//       Object.keys(this.loginForm.controls).forEach((key) => {
//         const control = this.loginForm.get(key)
//         control?.markAsTouched()
//       })
//       return
//     }

//     this.authService.login(this.loginForm.value).subscribe({
//       next: () => {
//         // Navigate to dashboard on successful login
//         this.router.navigate(["/"])
//       },
//       error: (error) => {
//         this.errorMessage = error.message
//       },
//     })
//   }

//   togglePasswordVisibility(): void {
//     this.passwordVisible = !this.passwordVisible
//   }

//   // Helper methods for form validation
//   get email() {
//     return this.loginForm.get("email")
//   }

//   get password() {
//     return this.loginForm.get("password")
//   }
// }
