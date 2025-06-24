import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss'],
})
export class DashboardCardComponent {
  @Input() title = '';
  @Input() value = '0';
  @Input() icon = 'dashboard';
  @Input() change?: string;
  @Input() cardClass?: string;
  @Input() iconBackground?: string;
  @Input() showProgress = false;
  @Input() progressValue = 0;
  @Input() progressText?: string;

  get formattedValue(): string {
    const numValue = Number.parseInt(this.value);
    if (numValue >= 1000000) {
      return (numValue / 1000000).toFixed(1) + 'م';
    } else if (numValue >= 1000) {
      return (numValue / 1000).toFixed(1) + 'ك';
    }
    return this.value;
  }

  isPositive(): boolean {
    return this.change
      ? this.change.includes('+') || this.change.includes('زيادة')
      : false;
  }

  isNegative(): boolean {
    return this.change
      ? this.change.includes('-') || this.change.includes('نقص')
      : false;
  }

  isNeutral(): boolean {
    return this.change ? !this.isPositive() && !this.isNegative() : false;
  }

  getChangeIcon(): string {
    if (this.isPositive()) return 'trending_up';
    if (this.isNegative()) return 'trending_down';
    return 'trending_flat';
  }

  getTrendClass(): string {
    if (this.isPositive()) return 'trend-up';
    if (this.isNegative()) return 'trend-down';
    return 'trend-flat';
  }
}
