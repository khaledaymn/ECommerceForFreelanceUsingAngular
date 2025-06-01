import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import type { Sale } from "../../../interfaces/sale.interface"

@Component({
  selector: "app-recent-sales",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./recent-sales.component.html",
  styleUrls: ["./recent-sales.component.scss"],
})
export class RecentSalesComponent {
  @Input() sales: Sale[] = []
}
