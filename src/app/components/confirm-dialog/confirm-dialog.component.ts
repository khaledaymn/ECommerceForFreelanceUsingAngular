
import { Component, Input, Output, EventEmitter, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements AfterViewInit {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() description = '';
  @Input() itemId?: string | number; // Optional ID of item to delete
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string | number | void>(); // Emits itemId if provided

  @ViewChild('deleteButton', { static: false }) deleteButton!: ElementRef<HTMLButtonElement>;

  ngAfterViewInit() {
    if (this.isOpen) {
      this.focusDeleteButton();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape(event: KeyboardEvent) {
    if (this.isOpen) {
      this.onClose();
    }
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleEnter(event: KeyboardEvent) {
    if (this.isOpen) {
      this.onConfirm();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onConfirm(): void {
    this.confirm.emit(this.itemId); // Emit itemId if provided, else void
  }

  private focusDeleteButton() {
    setTimeout(() => {
      this.deleteButton?.nativeElement.focus();
    }, 0);
  }
}
