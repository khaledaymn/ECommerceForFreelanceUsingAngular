import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-dashboard-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard-card.component.html",
  styleUrls: ["./dashboard-card.component.scss"],
})
export class DashboardCardComponent {
  @Input() title = ""
  @Input() value = 0
  @Input() icon = ""
  @Input() color = "blue"
  @Input() description = ""
  @Input() isLoading = false
  @Input() trend?: {
    value: number
    isPositive: boolean
  }

  get colorClass(): string {
    const colorMap: { [key: string]: string } = {
      blue: "card-blue",
      green: "card-green",
      purple: "card-purple",
      orange: "card-orange",
      yellow: "card-yellow",
      red: "card-red",
      indigo: "card-indigo",
      pink: "card-pink",
    }
    return colorMap[this.color] || "card-blue"
  }

  get iconClass(): string {
    // Return the Bootstrap Icon class directly
    return this.icon || "bi-box-seam"
  }

  get trendIconClass(): string {
    return this.trend?.isPositive ? "bi-arrow-up" : "bi-arrow-down"
  }

  formatNumber(num: number): string {
    return num.toLocaleString("ar-EG")
  }
}
