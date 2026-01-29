// Angular imports
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuth } from '../../services/admin-auth';

// Admin login component definition
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
// Admin login component class
export class Login {
  username = '';
  password = '';
  error = signal<string>('');

  // Constructor with dependencies
  constructor(private auth: AdminAuth, private router: Router) { }

  // Submit login form
  async submit() {
    this.error.set('');

    // Trim username and check for empty fields
    const u = this.username.trim();
    if (!u || !this.password?.trim()) {
      // Validate input
      this.error.set('Please enter a username and password.');
      return;
    }

    // Attempt login
    try {
      const ok = await this.auth.login(u, this.password);
      if (!ok) {
        // Login failed
        this.error.set('Invalid username or password.');
        return;
      }
      // Navigate to admin animals page on successful login
      this.router.navigate(['/admin/animals']);
    } catch (e: any) {
      // Set error message on exception
      this.error.set(e?.message || 'Login failed.');
    }
  }
}
