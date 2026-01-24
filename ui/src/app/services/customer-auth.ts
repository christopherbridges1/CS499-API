import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export type CustomerUser = {
  id: string;
  username: string;
};

type LoginResponse = {
  ok: boolean;
  token: string;
  customer: { id: string; username: string };
};

@Injectable({ providedIn: 'root' })
export class CustomerAuth {
  private tokenKey = 'customerToken';
  private userKey = 'customerUser';

  user = signal<CustomerUser | null>(this.loadUser());

  constructor(private router: Router) {}

  private loadUser(): CustomerUser | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? (JSON.parse(raw) as CustomerUser) : null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.user();
  }

 async register(username: string, password: string) {
  const res = await fetch('/api/customers/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  // Try to parse JSON either way
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // backend usually returns { ok:false, error:"..." }
    throw new Error(data?.error || `Registration failed (${res.status})`);
  }

  return data;
}
  /*
   * Returns true on success, false on invalid credentials.
   */
  async login(username: string, password: string): Promise<boolean> {
    if (!username?.trim() || !password?.trim()) return false;

    const res = await fetch('/api/customers/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password })
    });

    const data = (await res.json().catch(() => null)) as LoginResponse | any;

    if (!res.ok) {
      // 401 invalid credentials
      if (res.status === 401) return false;
      // other errors 
      throw new Error(data?.error || `Login failed (${res.status})`);
    }

    // Save token + user
    localStorage.setItem(this.tokenKey, data.token);
    const u: CustomerUser = { id: data.customer.id, username: data.customer.username };
    localStorage.setItem(this.userKey, JSON.stringify(u));
    this.user.set(u);

    return true;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user.set(null);
    this.router.navigate(['/customer/login']);
  }
}