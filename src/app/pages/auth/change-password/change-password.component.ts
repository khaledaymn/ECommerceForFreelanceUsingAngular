import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
// import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  changePasswordForm!: FormGroup;
  isSubmitting = false;
  userId: string | null = null;

  ngOnInit(): void {
    // Get userId from local storage via AuthService
    const currentUser = this.authService.getCurrentUser();
    this.userId = currentUser ? currentUser.id : null;

    if (!this.userId) {
      // Redirect to login if no user is found
      // this.toastService.show({
      //   message: 'يرجى تسجيل الدخول أولاً',
      //   type: 'error',
      // });
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();
  }

  private initForm(): void {
    this.changePasswordForm = this.fb.group(
      {
        oldPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmNewPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  // Custom validator to ensure new password matches confirm password
  private passwordMatchValidator(
    form: FormGroup
  ): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmNewPassword = form.get('confirmNewPassword')?.value;
    return newPassword &&
      confirmNewPassword &&
      newPassword !== confirmNewPassword
      ? { mismatch: true }
      : null;
  }

  // Check if a field is invalid and has been touched
  isFieldInvalid(fieldName: string): boolean {
    const field = this.changePasswordForm.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  // Get error message for a field
  getFieldError(fieldName: string): string {
    const field = this.changePasswordForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'هذا الحقل مطلوب';
      if (field.errors['minlength'])
        return `يجب أن يكون طول كلمة المرور ${field.errors['minlength'].requiredLength} أحرف على الأقل`;
      if (field.errors['pattern'])
        return 'يجب أن تحتوي كلمة المرور على حرف، رقم، ورمز خاص';
      if (
        fieldName === 'confirmNewPassword' &&
        this.changePasswordForm.errors?.['mismatch']
      )
        return 'كلمات المرور غير متطابقة';
    }
    return '';
  }

  submitChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmitting = true;
    const formValue = this.changePasswordForm.value;

    this.authService
      .changePassword({
        userId: this.userId,
        oldPassword: formValue.oldPassword,
        newPassword: formValue.newPassword,
      })
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.notification.success('نجاح', 'تم إعادة تعين كلمة المرور بنجاح ');
          this.changePasswordForm.reset();
          this.router.navigate(['/admin/products']); // Redirect to admin dashboard or desired route
        },
        error: (error) => {
          this.isSubmitting = false;
          const errorMessage =
            'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى.';
          this.notification.error('خطأ', errorMessage);
          console.error('Password change error:', error);
        },
      });
  }
}
