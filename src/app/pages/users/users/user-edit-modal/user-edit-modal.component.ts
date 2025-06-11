import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, UserDTO } from '../../../../interfaces/user.interface';
// import { User, UserDTO } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit-modal.component.html',
  styleUrls: ['./user-edit-modal.component.scss'],
})
export class UserEditModalComponent implements OnInit {
  @Input() user!: User;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UserDTO>();

  userForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      fName: ['', [Validators.required, Validators.maxLength(50)]],
      lName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.maxLength(20)]],
      address: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.userForm.patchValue({
        id: this.user.id,
        fName: this.user.fName,
        lName: this.user.lName,
        email: this.user.email,
        phoneNumber: this.user.phoneNumber,
        address: this.user.address,
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    if (this.userForm.valid) {
      const userDTO: UserDTO = {
        id: this.user.id,
        fName: this.userForm.get('fName')?.value,
        lName: this.userForm.get('lName')?.value,
        email: this.userForm.get('email')?.value,
        phoneNumber: this.userForm.get('phoneNumber')?.value || undefined,
        address: this.userForm.get('address')?.value || undefined,
      };
      this.save.emit(userDTO);
    }
  }
}