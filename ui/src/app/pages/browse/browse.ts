// Component for browsing available animals
import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerAuth } from '../../services/customer-auth';
import { Favorites } from '../../services/favorites';

// Animal type definition
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

// Browse component definition
@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './browse.html',
  styleUrls: ['./browse.css']
})
// Browse component class
export class Browse {
  query = signal('');

  loading = signal(false);
  error = signal('');

  // Now loaded from DB
  dogs = signal<Animal[]>([]);

  // Filtered dogs based on search query
  filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.dogs();
    return this.dogs().filter(d =>
      `${d.name} ${d.breed}`.toLowerCase().includes(q)
    );
  });

  // Constructor with dependencies
  constructor(public auth: CustomerAuth, public fav: Favorites) {
    this.load();
  }

  // Load animals from API
  async load() {
    this.loading.set(true);
    this.error.set('');

    // Fetch animals from the API
    try {
      const res = await fetch('/api/animals');
      const data = await res.json().catch(() => null);

      // Handle non-OK responses
      if (!res.ok) {
        // Throw error with message from response or default message
        throw new Error(data?.error || `Failed to load animals (${res.status})`);
      }

      // Set the loaded dogs
      this.dogs.set(data?.animals || []);
    } catch (e: any) {
      // Handle errors during fetch
      this.error.set(e?.message || 'Failed to load animals.');
      this.dogs.set([]);
    } finally {
      // Set loading to false after operation
      this.loading.set(false);
    }
  }

  // Toggle favorite status of an animal
  toggleFavorite(animalId: string) {
    if (!this.auth.isLoggedIn()) {
      window.location.href = '/customer/login';
      return;
    }
    this.fav.toggle(animalId);
  }

  // Check if an animal is a favorite
  isFav(animalId: string): boolean {
    if (!this.auth.isLoggedIn()) return false;
    return this.fav.has(animalId);
  }

  // Get favorite key for an animal
  favKey(a: Animal) {
    return a._id;
  }
}
