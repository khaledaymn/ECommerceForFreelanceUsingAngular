import { Component, OnInit, ErrorHandler } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-form',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  returnUrl: string | null = null;
  hidePassword = true;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'من فضلك أدخل بريدًا إلكترونيًا وكلمة مرور صحيحة.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.email!.value, this.password!.value).subscribe({
      next: (user) => {
        this.loading = false;
        const redirectPath = user.role === 'Admin' ? '/admin' : '/user';
        this.router.navigate([redirectPath]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          'فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.';
      },
    });
  }
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
