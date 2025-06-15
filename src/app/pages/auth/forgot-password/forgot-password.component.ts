import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isSubmitted = false;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService // ضيف الـ Service هنا
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  get email() {
    return this.forgotPasswordForm.get('email');
  }
  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const email = this.forgotPasswordForm.get('email')?.value;

      this.authService.forgotPassword(email).subscribe({
        next: (response) => {
          this.loading = false;
          this.isSubmitted = true;
          this.successMessage =
            'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 7000); // إعادة التوجيه بعد 7 ثوانٍ
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'حدث خطأ، حاول مرة أخرى';
        },
      });
    }
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }
}
