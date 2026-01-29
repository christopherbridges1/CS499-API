// Home page showing favorite animals for logged in users
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CustomerAuth } from '../../services/customer-auth';
import { Favorites } from '../../services/favorites';
import { AdminAnimals, Animal } from '../../services/admin-animals';

// Home component definition
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
  // Home component class
export class Home implements OnInit {
  favoriteAnimals: Animal[] = [];
  loadingFavorites = false;
  favoritesError = '';

  // Constructor with dependencies
  constructor(
    public auth: CustomerAuth,
    public favorites: Favorites,
    private animals: AdminAnimals
  ) {}

  // On initialization, load favorite animals
  async ngOnInit() {
    await this.loadFavorites();
  }

  // Load favorite animals for the logged-in user
  async loadFavorites() {
    this.favoritesError = '';
    const ids = new Set(this.favorites.list());

    // if user has no favorites, show empty state
    if (!this.auth.isLoggedIn() || ids.size === 0) {
      this.favoriteAnimals = [];
      return;
    }

    // load all animals and filter to favorites
    this.loadingFavorites = true;
    // reset favorites
    try {
      const all = await this.animals.list();
      this.favoriteAnimals = all.filter(a => ids.has(a._id));

      // sort according to favorites order
      const order = this.favorites.list();
      this.favoriteAnimals.sort(
        (a, b) => order.indexOf(a._id) - order.indexOf(b._id)
      );
    } catch (e: any) {
      this.favoritesError = e?.message || 'Failed to load favorites';
      this.favoriteAnimals = [];
    } finally {
      this.loadingFavorites = false;
    }
  }
}
