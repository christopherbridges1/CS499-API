import { Injectable, signal } from '@angular/core';

type AdminUser = { id: string; username: string; role: string };

@Injectable({ providedIn: 'root' })
export class AdminAuth {
  private tokenKey = 'adminToken';
  private userKey = 'adminUser';

  user = signal<AdminUser | null>(this.loadUser());

  private loadUser(): AdminUser | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.tokenKey) && !!this.user();
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  async login(username: string, password: string): Promise<boolean> {
    const u = username?.trim();
    const p = password?.trim();
    if (!u || !p) return false;

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 401) return false;
      throw new Error(data?.error || `Login failed (${res.status})`);
    }

    localStorage.setItem(this.tokenKey, data.token);
    localStorage.setItem(this.userKey, JSON.stringify(data.user));
    this.user.set(data.user);
    return true;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user.set(null);
  }
}