import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerAuth } from '../../services/customer-auth'; 

@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-register.html',
  styleUrls: ['./customer-register.css']
})
export class CustomerRegister {
  username = '';
  password = '';
  confirmPassword = '';
  error = signal<string>('');

  constructor(private auth: CustomerAuth, private router: Router) {}

  async submit() {
    this.error.set('');

    const u = this.username.trim();
    if (!u || !this.password || !this.confirmPassword) {
      this.error.set('Please fill out all fields.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    try {
      // create account
      await this.auth.register(u, this.password);

      // Option A (simple): send them to login
      this.router.navigate(['/customer/login']);
    } catch (e: any) {
      this.error.set(e?.message || 'Registration failed.');
    }
  }
}