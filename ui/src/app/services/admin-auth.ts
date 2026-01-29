// Service to manage admin user authentication
import { Injectable, signal } from '@angular/core';

// Admin user type definition
type AdminUser = { id: string; username: string; role: string };

// AdminAuth service definition
@Injectable({ providedIn: 'root' })
// AdminAuth service class
export class AdminAuth {
  private tokenKey = 'adminToken';
  private userKey = 'adminUser';

  // User signal to hold the current admin user
  user = signal<AdminUser | null>(this.loadUser());

  // Get the current admin user
  private loadUser(): AdminUser | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  }

  // Check if admin user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey) && !!this.user();
  }

  // Get the stored authentication token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Perform login with username and password
  async login(username: string, password: string): Promise<boolean> {
    const u = username?.trim();
    const p = password?.trim();
    if (!u || !p) return false;

    // Send login request to the server
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password })
    });

    // Parse response data
    const data = await res.json().catch(() => null);

    // Handle login failure
    if (!res.ok) {
      if (res.status === 401) return false;
      throw new Error(data?.error || `Login failed (${res.status})`);
    }

    // Store token and user data on successful login
    localStorage.setItem(this.tokenKey, data.token);
    localStorage.setItem(this.userKey, JSON.stringify(data.user));
    this.user.set(data.user);
    return true;
  }

  // Perform logout
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user.set(null);
  }
}
