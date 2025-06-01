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
  @Input() value = ""
  @Input() change = ""
  @Input() icon = ""

  isPositive(): boolean {
    return this.change.includes("+")
  }

  isNegative(): boolean {
    return this.change.includes("-")
  }

  // getIcon method removed as per updates
}
