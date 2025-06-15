import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  loading: boolean = false;
  email: string | null = null;
  token: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialize form with 'passwordConfirmation' to match template
    this.resetPasswordForm = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        passwordConfirmation: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  ngOnInit(): void {
    // Extract email and token from query parameters
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || null;
      this.token = params['token'] || null;
    });
    console.log('Email:', this.email);
    console.log('Token:', this.token);
  }

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.passwordVisible = !this.passwordVisible;
    } else if (field === 'passwordConfirmation') {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }
  }

  passwordsMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('password')?.value;
    const passwordConfirmation = form.get('passwordConfirmation')?.value;
    return password === passwordConfirmation
      ? null
      : { passwordMismatch: true };
  }

  get password() {
    return this.resetPasswordForm.get('password');
  }

  get passwordConfirmation() {
    return this.resetPasswordForm.get('passwordConfirmation');
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.email && this.token) {
      this.loading = true;
      this.errorMessage = null;
      this.successMessage = null;

      const { password } = this.resetPasswordForm.value;

      this.authService
        .resetPassword(this.email, this.token, password)
        .subscribe({
          next: () => {
            this.loading = false;
            this.successMessage = 'تم إعادة تعيين كلمة المرور بنجاح!';
            this.resetPasswordForm.reset();
          },
          error: (err) => {
            this.loading = false;
            this.errorMessage =
              err.message || 'فشل في إعادة تعيين كلمة المرور. حاول مرة أخرى.';
          },
        });
    } else {
      this.errorMessage =
        'الرجاء ملء النموذج بشكل صحيح أو تحقق من البريد الإلكتروني ورمز التحقق.';
    }
  }
}
