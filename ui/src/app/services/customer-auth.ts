// Service to handle customer authentication
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

// Customer user type definition
export type CustomerUser = {
  id: string;
  username: string;
};

// Login response type definition
type LoginResponse = {
  ok: boolean;
  token: string;
  customer: { id: string; username: string };
};

// CustomerAuth service definition
@Injectable({ providedIn: 'root' })
// CustomerAuth service class
export class CustomerAuth {
  private tokenKey = 'customerToken';
  private userKey = 'customerUser';

  // User signal to hold the current customer user
  user = signal<CustomerUser | null>(this.loadUser());

  // Constructor with router dependency
  constructor(private router: Router) { }

  // Load the current customer user from local storage
  private loadUser(): CustomerUser | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? (JSON.parse(raw) as CustomerUser) : null;
  }

  // Get the stored authentication token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Check if customer user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.user();
  }

  // Register a new customer account
  async register(username: string, password: string) {
    const res = await fetch('/api/customers/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    // Try to parse JSON either way
    const data = await res.json().catch(() => null);

    // Handle registration failure
    if (!res.ok) {
      throw new Error(data?.error || `Registration failed (${res.status})`);
    }

    // Return the response data on success
    return data;
  }
  // Perform login with username and password
  async login(username: string, password: string): Promise<boolean> {
    if (!username?.trim() || !password?.trim()) return false;

    // Send login request to the server
    const res = await fetch('/api/customers/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password })
    });

    // Parse response data
    const data = (await res.json().catch(() => null)) as LoginResponse | any;

    // Handle login failure
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

    // Successful login
    return true;
  }

  // Perform logout
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user.set(null);
    this.router.navigate(['/customer/login']);
  }
}
