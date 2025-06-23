import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isLoading = false;
  storeUrl = 'https://heavyequipments.vercel.app/'; // Replace with your actual store URL

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  async logout() {
    this.isLoading = true;

    try {
      await this.authService.logout();
      this.router.navigate(['/auth/login']);
      this.notificationService.success(
        'تم تسجيل الخروج بنجاح',
        'تسجيل الخروج تم بنجاح'
      );
    } catch (error) {
      this.notificationService.error(
        'خطأ اثناء تسجيل الخروج',
        'فشل في تسجيل الخروج يرجي اعادة المحاوله لاحقا.'
      );
    } finally {
      this.isLoading = false;
    }
  }

  openStore() {
    this.notificationService.info(
      'جاري فتح المتجر...',
      'سوف يتم فتح المتجر الان.'
    );
  }
}
