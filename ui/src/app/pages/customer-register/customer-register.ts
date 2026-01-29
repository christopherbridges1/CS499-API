// Component for customer registration page
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerAuth } from '../../services/customer-auth';

// Customer registration component definition
@Component({
  selector: 'app-customer-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-register.html',
  styleUrls: ['./customer-register.css']
})
// Customer registration component class
export class CustomerRegister {
  username = '';
  password = '';
  confirmPassword = '';
  error = signal<string>('');

  // Constructor with dependencies
  constructor(private auth: CustomerAuth, private router: Router) { }

  // Submit registration form
  async submit() {
    this.error.set('');

    // Validate input fields
    const u = this.username.trim();
    if (!u || !this.password || !this.confirmPassword) {
      this.error.set('Please fill out all fields.');
      return;
    }

    // Check if passwords match
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    try {
      // creates account
      await this.auth.register(u, this.password);

      // Send to login
      this.router.navigate(['/customer/login']);
    } catch (e: any) {
      this.error.set(e?.message || 'Registration failed.');
    }
  }
}
