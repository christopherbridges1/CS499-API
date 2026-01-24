import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CustomerAuth } from '../../services/customer-auth';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-login.html',
  styleUrls: ['./customer-login.css']
})
export class CustomerLogin {
  username = '';
  password = '';
  error = signal('');

  constructor(private auth: CustomerAuth, private router: Router) { }

  async submit() {
    this.error.set('');

    const u = this.username.trim();
    const p = this.password;

    if (!u || !p?.trim()) {
      this.error.set('Please enter a username and password.');
      return;
    }

    try {
      const ok = await this.auth.login(u, p);
      if (!ok) {
        this.error.set('Invalid username or password.');
        return;
      }
      this.router.navigate(['/browse']);
    } catch (e: any) {
      this.error.set(e?.message || 'Login failed.');
    }
  }
}