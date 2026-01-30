// Manages list of favorite animal IDs for user
import { Injectable, signal } from '@angular/core';
import { CustomerAuth } from './customer-auth';

type AnimalLike = { _id: string };

@Injectable({ providedIn: 'root' })
export class Favorites {
  constructor(private auth: CustomerAuth) {
    // Initialize count from current storage
    this.syncCountFromStorage();
  }

  // incremented whenever favorites change (used by components to refresh)
  favoritesChanged = signal(0);

  // stable reactive count for templates (avoid calling count() in HTML)
  countSignal = signal<number>(0);

  // Generate a unique key for storing favorites in local storage
  private key(): string {
    const u = this.auth.user();
    return u ? `favorites:${u.id}` : `favorites:guest`;
  }

  private readSet(): Set<string> {
    const raw = localStorage.getItem(this.key());
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(arr);
  }

  private writeSet(set: Set<string>) {
    localStorage.setItem(this.key(), JSON.stringify(Array.from(set)));
  }

  private syncCountFromStorage() {
    this.countSignal.set(this.readSet().size);
  }

  // Replace local favorites with an exact list (server truth)
  private setIds(ids: string[]) {
    this.writeSet(new Set(ids));
    this.syncCountFromStorage();
  }

  list(): string[] {
    return Array.from(this.readSet());
  }

  has(animalId: string): boolean {
    return this.readSet().has(animalId);
  }

  // Local-only toggle (used for optimistic UI)
  toggle(animalId: string): boolean {
    const set = this.readSet();
    if (set.has(animalId)) set.delete(animalId);
    else set.add(animalId);

    this.writeSet(set);
    this.syncCountFromStorage();
    this.favoritesChanged.update(v => v + 1);

    return set.has(animalId);
  }

  // Keep this for non-template usage only (don’t call from HTML)
  count(): number {
    return this.readSet().size;
  }

  clear() {
    this.writeSet(new Set());
    this.syncCountFromStorage();
    this.favoritesChanged.update(v => v + 1);
  }

  // Fetch favorites from server and sync localStorage

  async listAnimals(): Promise<any[]> {
    const token = this.auth.getToken();
    if (!token) return [];

    const res = await fetch('/api/favorites', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || 'Failed to load favorites');
    }

    const animals = (data.animals || []) as AnimalLike[];

    const ids = animals.map(a => a._id).filter(Boolean);
    setTimeout(() => this.setIds(ids), 0);
    return animals;
  }
  // Toggle a favorite on the server WITHOUT directly toggling localStorage.
  async toggleServerNoLocal(animalId: string, wasFav: boolean): Promise<void> {
    const token = this.auth.getToken();
    if (!token) throw new Error('Not logged in');

    const method = wasFav ? 'DELETE' : 'POST';

    const res = await fetch(`/api/favorites/${animalId}`, {
      method,
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.ok === false) {
      throw new Error(data?.error || 'Failed to update favorite');
    }

    // Notify UI to refresh. Home will re-fetch and re-sync ids.
    this.favoritesChanged.update(v => v + 1);
  }
}
