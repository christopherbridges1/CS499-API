import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerAuth } from '../../services/customer-auth';
import { Favorites } from '../../services/favorites';

type Animal = {
  _id: string;
  name: string;
  breed: string;
  ageWeeks?: number;
  sex?: string;
  description?: string;
  status?: string;
  rescueType?: string;
  location?: { type: 'Point'; coordinates?: number[] };
};

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './browse.html',
  styleUrls: ['./browse.css']
})
export class Browse {
  query = signal('');

  loading = signal(false);
  error = signal('');

  // Now loaded from DB
  dogs = signal<Animal[]>([]);

  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.dogs();
    return this.dogs().filter(d =>
      `${d.name} ${d.breed}`.toLowerCase().includes(q)
    );
  });

  constructor(public auth: CustomerAuth, public fav: Favorites) {
    this.load();
  }

  async load() {
    this.loading.set(true);
    this.error.set('');

    try {
      const res = await fetch('/api/animals');
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to load animals (${res.status})`);
      }

      this.dogs.set(data?.animals || []);
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to load animals.');
      this.dogs.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  toggleFavorite(animalId: string) {
    if (!this.auth.isLoggedIn()) {
      window.location.href = '/customer/login';
      return;
    }
    this.fav.toggle(animalId);
  }

  isFav(animalId: string): boolean {
    if (!this.auth.isLoggedIn()) return false;
    return this.fav.has(animalId);
  }

  favKey(a: Animal) {
    return a._id;
  }
}