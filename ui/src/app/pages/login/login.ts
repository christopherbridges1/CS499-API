import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuth } from '../../services/admin-auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  username = '';
  password = '';
  error = signal<string>('');

  constructor(private auth: AdminAuth, private router: Router) { }

  async submit() {
    this.error.set('');

    const u = this.username.trim();
    if (!u || !this.password?.trim()) {
      this.error.set('Please enter a username and password.');
      return;
    }

    try {
      const ok = await this.auth.login(u, this.password);
      if (!ok) {
        this.error.set('Invalid username or password.');
        return;
      }
      this.router.navigate(['/admin/animals']);
    } catch (e: any) {
      this.error.set(e?.message || 'Login failed.');
    }
  }
}