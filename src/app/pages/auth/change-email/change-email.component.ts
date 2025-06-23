// import { Component, OnInit, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import {
//   FormBuilder,
//   FormGroup,
//   ReactiveFormsModule,
//   Validators,
// } from '@angular/forms';
// import { Router, RouterLink, ActivatedRoute } from '@angular/router';
// import { UserService } from '../../../services/user.service';
// import { AuthService } from '../../../services/auth.service';
// import { UserDTO } from '../../../interfaces/user.interface';
// // import { AuthService } from '../../services/auth.service';
// // import { UserService, UserDTO } from '../../services/user.service';

// @Component({
//   selector: 'app-update-user-email',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './change-email.component.html',
//   styleUrls: ['./change-email.component.scss'],
// })
// export class ChangeEmailComponent implements OnInit {
//   private fb = inject(FormBuilder);
//   private authService = inject(AuthService);
//   private userService = inject(UserService);
//   private router = inject(Router);
//   private activatedRoute = inject(ActivatedRoute);

//   updateEmailForm!: FormGroup;
//   isSubmitting = false;
//   userId: string | null = null;
//   currentUser: any | null = null; // To store current user data

//   ngOnInit(): void {
//     // Check if user is admin
//     if (!this.authService.hasRole('Admin')) {
//       // this.toastService.show({
//       //   message: 'Access forbidden. Admin role required.',
//       //   type: 'error',
//       // });
//       this.router.navigate(['/login']);
//       return;
//     }

//     // Get userId from route params
//     this.userId = this.activatedRoute.snapshot.paramMap.get('id');
//     if (!this.userId) {
//       // this.toastService.show({
//       //   message: 'معرف المستخدم غير متوفر.',
//       //   type: 'error',
//       // });
//       this.router.navigate(['/admin/dashboard']);
//       return;
//     }

//     // Get current user data from local storage
//     this.currentUser = this.authService.getCurrentUser();
//     this.initForm();
//   }

//   private initForm(): void {
//     this.updateEmailForm = this.fb.group({
//       email: [
//         this.currentUser?.email || '',
//         [Validators.required, Validators.email],
//       ],
//     });
//   }

//   // Check if a field is invalid and has been touched
//   isFieldInvalid(fieldName: string): boolean {
//     const field = this.updateEmailForm.get(fieldName);
//     return !!(field && field.invalid && (field.touched || field.dirty));
//   }

//   // Get error message for a field
//   getFieldError(fieldName: string): string {
//     const field = this.updateEmailForm.get(fieldName);
//     if (field?.errors) {
//       if (field.errors['required']) return 'هذا الحقل مطلوب';
//       if (field.errors['email']) return 'البريد الإلكتروني غير صحيح';
//     }
//     return '';
//   }

//   submitUpdateEmail(): void {
//     if (this.updateEmailForm.invalid) {
//       this.updateEmailForm.markAllAsTouched();
//       // this.toastService.show({
//       //   message: 'يرجى إدخال بريد إلكتروني صحيح',
//       //   type: 'error',
//       // });
//       return;
//     }

//     if (!this.userId || !this.currentUser) {
//       // this.toastService.show({
//       //   message: 'معرف المستخدم أو بيانات المستخدم غير متوفرة.',
//       //   type: 'error',
//       // });
//       this.router.navigate(['/admin/dashboard']);
//       return;
//     }

//     this.isSubmitting = true;
//     const formValue = this.updateEmailForm.value;

//     const userDto: UserDTO = {
//       id: this.userId,
//       fName: this.currentUser.firstName,
//       lName: this.currentUser.lastName,
//       email: formValue.email,
//       phoneNumber: this.currentUser.phoneNumber || undefined,
//       address: this.currentUser.address || undefined,
//     };

//     this.userService.updateUser(this.userId, userDto).subscribe({
//       next: (response) => {
//         this.isSubmitting = false;
//         // Update local storage if the updated user is the current user
//         if (this.currentUser && this.currentUser.id === this.userId) {
//           this.currentUser.email = formValue.email;
//           this.authService['setUser'](this.currentUser); // Access private method via bracket notation
//         }
//         // this.toastService.show({
//         //   message: response.message || 'تم تحديث البريد الإلكتروني بنجاح!',
//         //   type: 'success',
//         // });
//         this.router.navigate(['/admin/dashboard']);
//       },
//       error: (error) => {
//         this.isSubmitting = false;
//         const errorMessage =
//           error.message || 'حدث خطأ أثناء تحديث البريد الإلكتروني.';
//         // this.toastService.show({
//         //   message: errorMessage,
//         //   type: 'error',
//         // });
//         console.error('Email update error:', error);
//       },
//     });
//   }
// }
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { UserDTO } from '../../../interfaces/user.interface';
// import { AuthService } from '../../services/auth.service';
// import { NotificationService } from '../../services/notification.service';
// import { UserService, UserDTO } from '../../services/user.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-email.component.html',
  styleUrls: ['./change-email.component.scss'],
})
export class UserManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private notification = inject(NotificationService);
  private userService = inject(UserService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  changePasswordForm!: FormGroup;
  updateEmailForm!: FormGroup;
  isSubmittingPassword = false;
  isSubmittingEmail = false;
  userId: string | null = null;
  currentUser: any | null = null;

  ngOnInit(): void {
    // Check if user is admin for email update
    if (!this.authService.hasRole('Admin')) {
      // this.toastService.show({
      //   message: 'Access forbidden. Admin role required.',
      //   type: 'error',
      // });
      this.router.navigate(['/login']);
      return;
    }

    // Get userId from route params for email update, fallback to current user for password change
    this.userId = this.activatedRoute.snapshot.paramMap.get('id');
    this.currentUser = this.authService.getCurrentUser();

    if (!this.userId && !this.currentUser) {
      // this.toastService.show({
      //   message: 'معرف المستخدم غير متوفر. يرجى تسجيل الدخول.',
      //   type: 'error',
      // });
      this.router.navigate(['/admin/products']);
      return;
    }

    // Use current user's ID for password change if no route param provided
    this.userId = this.userId || this.currentUser?.id;

    this.initForms();
  }

  private initForms(): void {
    // Password Change Form
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

    // Email Update Form
    this.updateEmailForm = this.fb.group({
      email: [
        this.currentUser?.email || '',
        [Validators.required, Validators.email],
      ],
    });
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
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  // Get error message for a field
  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'هذا الحقل مطلوب';
      if (field.errors['email']) return 'البريد الإلكتروني غير صحيح';
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
      // this.toastService.show({
      //   message: 'يرجى إكمال جميع الحقول المطلوبة بشكل صحيح',
      //   type: 'error',
      // });
      return;
    }

    if (!this.userId) {
      // this.toastService.show({
      //   message: 'معرف المستخدم غير متوفر. يرجى تسجيل الدخول.',
      //   type: 'error',
      // });
      this.router.navigate(['/login']);
      return;
    }

    this.isSubmittingPassword = true;
    const formValue = this.changePasswordForm.value;

    this.authService
      .changePassword({
        userId: this.userId,
        oldPassword: formValue.oldPassword,
        newPassword: formValue.newPassword,
      })
      .subscribe({
        next: (response) => {
          this.isSubmittingPassword = false;
          this.notification.success('نجاح', 'تم إعادة تعيين كلمة المرور بنجاح');
          this.changePasswordForm.reset();
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          this.isSubmittingPassword = false;
          const errorMessage =
            'حدث خطأ أثناء تغيير كلمة المرور. يرجى المحاولة مرة أخرى.';
          this.notification.error('خطأ', errorMessage);
          console.error('Password change error:', error);
        },
      });
  }

  submitUpdateEmail(): void {
    if (this.updateEmailForm.invalid) {
      this.updateEmailForm.markAllAsTouched();
      // this.toastService.show({
      //   message: 'يرجى إدخال بريد إلكتروني صحيح',
      //   type: 'error',
      // });
      return;
    }

    if (!this.userId || !this.currentUser) {
      // this.toastService.show({
      //   message: 'معرف المستخدم أو بيانات المستخدم غير متوفرة.',
      //   type: 'error',
      // });
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    this.isSubmittingEmail = true;
    const formValue = this.updateEmailForm.value;

    const userDto: UserDTO = {
      id: this.userId,
      fName: this.currentUser.firstName || this.currentUser.fName,
      lName: this.currentUser.lastName || this.currentUser.lName,
      email: formValue.email,
      phoneNumber: this.currentUser.phoneNumber || undefined,
      address: this.currentUser.address || undefined,
    };

    this.userService.updateUser(this.userId, userDto).subscribe({
      next: (response) => {
        this.isSubmittingEmail = false;
        // Update local storage if the updated user is the current user
        if (this.currentUser && this.currentUser.id === this.userId) {
          this.currentUser.email = formValue.email;
          const user: any = {
            ...this.currentUser,
            firstName: this.currentUser.firstName || this.currentUser.fName,
            lastName: this.currentUser.lastName || this.currentUser.lName,
            role: this.currentUser.role || 'user',
          };
          this.authService['setUser'](user); // Access private method
        }
        // this.toastService.show({
        //   message: response.message || 'تم تحديث البريد الإلكتروني بنجاح!',
        //   type: 'success',
        // });
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        this.isSubmittingEmail = false;
        const errorMessage =
          error.message || 'حدث خطأ أثناء تحديث البريد الإلكتروني.';
        // this.toastService.show({
        //   message: errorMessage,
        //   type: 'error',
        // });
        console.error('Email update error:', error);
      },
    });
  }
}
