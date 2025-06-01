import {
  Component,
  type AfterViewInit,
  type ElementRef,
  ViewChild,
  Input,
  type OnChanges,
  type SimpleChanges,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import type { ChartData } from "../../../interfaces/chart-data.interface"

@Component({
  selector: "app-chart",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./chart.component.html",
  styleUrls: ["./chart.component.scss"],
})
export class ChartComponent implements AfterViewInit, OnChanges {
  @ViewChild("chartCanvas") chartCanvas!: ElementRef<HTMLCanvasElement>
  @Input() data: ChartData = { labels: [], datasets: [] }

  ngAfterViewInit() {
    if (this.data.labels.length > 0) {
      this.drawChart()
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["data"] && !changes["data"].firstChange && this.chartCanvas) {
      this.drawChart()
    }
  }

  drawChart() {
    const canvas = this.chartCanvas.nativeElement
    const ctx = canvas.getContext("2d")

    if (!ctx || !this.data.datasets[0]) return

    // Set canvas dimensions
    canvas.width = canvas.parentElement?.clientWidth || 600
    canvas.height = canvas.parentElement?.clientHeight || 350

    const data = this.data.datasets[0].data
    const labels = this.data.labels

    const maxValue = Math.max(...data)
    const barWidth = (canvas.width - 60) / data.length - 10
    const barHeightRatio = (canvas.height - 60) / maxValue

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw axes
    ctx.beginPath()
    ctx.moveTo(30, 20)
    ctx.lineTo(30, canvas.height - 30)
    ctx.lineTo(canvas.width - 20, canvas.height - 30)
    ctx.strokeStyle = "#e5e7eb"
    ctx.stroke()

    // Draw bars
    data.forEach((value, index) => {
      const x = 40 + index * (barWidth + 10)
      const barHeight = value * barHeightRatio
      const y = canvas.height - 30 - barHeight

      // Draw bar
      ctx.fillStyle = "#F5C518"
      ctx.fillRect(x, y, barWidth, barHeight)

      // Draw month label
      ctx.fillStyle = "#6b7280"
      ctx.font = "12px Cairo"
      ctx.textAlign = "center"
      ctx.fillText(labels[index], x + barWidth / 2, canvas.height - 10)

      // Draw value on top of bar
      ctx.fillStyle = "#374151"
      ctx.fillText(`${(value / 1000).toFixed(0)}ك ر.س.`, x + barWidth / 2, y - 5)
    })
  }
}
