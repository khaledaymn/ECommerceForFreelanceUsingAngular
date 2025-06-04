import { Component, Input, Output, EventEmitter } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-pagination",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./pagination.component.html",
  styleUrls: ["./pagination.component.scss"],
})
export class PaginationComponent {
  @Input() currentPage = 1
  @Input() totalPages = 1
  @Input() totalItems = 0
  @Input() pageSize = 10
  @Output() pageChange = new EventEmitter<number>()

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems)
  }

  get visiblePages(): (number)[] {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number)[] = []

    for (
      let i = Math.max(2, this.currentPage - delta);
      i <= Math.min(this.totalPages - 1, this.currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (this.currentPage - delta > 2) {
      rangeWithDots.push(1)
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (this.currentPage + delta < this.totalPages - 1) {
      rangeWithDots.push(this.totalPages)
    } else if (this.totalPages > 1) {
      rangeWithDots.push(this.totalPages)
    }

    return rangeWithDots
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page)
    }
  }
}
