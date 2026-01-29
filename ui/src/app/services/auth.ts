// Service to manage user authentication state
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

// Auth service definition
@Injectable({ providedIn: 'root' })
export class Auth {

  // Signal to track login state
  isLoggedIn = signal<boolean>(localStorage.getItem('isLoggedIn') === 'true');  // Test!!!!

  // Constructor with router dependency
  constructor(private router: Router) { }

  // Perform login with username and password
  login(username: string, password: string): boolean {
    if (!username?.trim() || !password?.trim()) return false;

    // Store login state in local storage and update signal
    localStorage.setItem('isLoggedIn', 'true');
    this.isLoggedIn.set(true);
    return true;
  }

  // Perform logout
  logout() {
    localStorage.removeItem('isLoggedIn');
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}
