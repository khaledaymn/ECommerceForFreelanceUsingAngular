import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../interfaces/user.interface';
// import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent {
  @Input() user!: User;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() updateUser = new EventEmitter<User>();

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    this.updateUser.emit(this.user);
  }
   onBlockUser(): void {
    // Toggle user block status and emit update event
    this.user.isDeleted = !this.user.isDeleted;
    this.updateUser.emit(this.user);
  }
}