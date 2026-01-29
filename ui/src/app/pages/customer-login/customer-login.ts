// Component for customer login page.
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CustomerAuth } from '../../services/customer-auth';

// Customer login component definition
@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-login.html',
  styleUrls: ['./customer-login.css']
})
// Customer login component class
export class CustomerLogin {
  username = '';
  password = '';
  error = signal('');

  // Constructor with dependencies
  constructor(private auth: CustomerAuth, private router: Router) { }

  // Submit login form
  async submit() {
    this.error.set('');

    // Trim username and check for empty fields
    const u = this.username.trim();
    const p = this.password;

    // Validate input
    if (!u || !p?.trim()) {
      this.error.set('Please enter a username and password.');
      return;
    }

    // Attempt login
    try {
      const ok = await this.auth.login(u, p);
      if (!ok) {
        // Login failed
        this.error.set('Invalid username or password.');
        return;
      }
      // Navigate to browse page on successful login
      this.router.navigate(['/browse']);
    } catch (e: any) {
      this.error.set(e?.message || 'Login failed.');
    }
  }
}
