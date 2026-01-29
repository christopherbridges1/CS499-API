// Manages a list of favorite animal IDs for user
import { Injectable } from '@angular/core';
import { CustomerAuth } from './customer-auth';

// Favorites service definition
@Injectable({ providedIn: 'root' })
// Favorites service class
export class Favorites {
  constructor(private auth: CustomerAuth) { }

  //  Generate a unique key for storing favorites in local storage
  private key(): string {
    const u = this.auth.user();
    return u ? `favorites:${u.id}` : `favorites:guest`;
  }

  // Read the set of favorite animal IDs from local storage
  private readSet(): Set<string> {
    const raw = localStorage.getItem(this.key());
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(arr);
  }

  // Write the set of favorite animal IDs to local storage
  private writeSet(set: Set<string>) {
    localStorage.setItem(this.key(), JSON.stringify(Array.from(set)));
  }

  // List all favorite animal IDs
  list(): string[] {
    return Array.from(this.readSet());
  }

  // Check if an animal ID is in favorites
  has(animalId: string): boolean {
    return this.readSet().has(animalId);
  }

  // Toggle the favorite status of an animal ID
  toggle(animalId: string): boolean {
    const set = this.readSet();
    if (set.has(animalId)) set.delete(animalId);
    else set.add(animalId);
    this.writeSet(set);
    return set.has(animalId);
  }

  // Get the count of favorite animal IDs
  count(): number {
    return this.readSet().size;
  }

  // Clear all favorite animal IDs
  clear() {
    this.writeSet(new Set());
  }
}
