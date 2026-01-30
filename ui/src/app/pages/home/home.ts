// Home page showing favorite animals for logged in users
import { Component, effect, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';

import { CustomerAuth } from '../../services/customer-auth';
import { Favorites } from '../../services/favorites';
import { Animal } from '../../services/admin-animals';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnDestroy, OnInit {
  favoriteAnimals: Animal[] = [];
  loadingFavorites = false;
  favoritesError = '';
  
  private didRetryEmpty = false;

  // Prevent stale calls from overwriting 
  private loadSeq = 0;

  // Prevent duplicate router 
  private navSub: Subscription;

 constructor(
  private router: Router,
  public auth: CustomerAuth,
  public favorites: Favorites,
  private cdr: ChangeDetectorRef
) {
  console.log('Home constructor, current URL:', this.router.url);
  
  // Reload favorites whenever we navigate to Home
  this.navSub = this.router.events
    .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
    .subscribe((event) => {  // Changed 'e' in subscribe to 'event'
      console.log('Navigation event:', event.url);
      if (this.router.url === '/' || this.router.url.startsWith('/home')) {
        void this.loadFavorites();
      }
    });

  // Reload favorites whenever login/logout happens
  effect(() => {
    this.auth.user();
    console.log('Effect triggered, calling loadFavorites'); 
    void this.loadFavorites();
  });
}

ngOnInit() {
  console.log('ngOnInit called');
  void this.loadFavorites();
}

ngOnDestroy() {
  this.navSub.unsubscribe();
}
async loadFavorites() {
  console.log('loadFavorites called, isLoggedIn:', this.auth.isLoggedIn());
  const seq = ++this.loadSeq;
  this.favoritesError = '';

  if (!this.auth.isLoggedIn()) {
    this.favoriteAnimals = [];
    this.didRetryEmpty = false;
    return;
  }

  this.loadingFavorites = true;

  try {
    const animals = await this.favorites.listAnimals();
    console.log('First fetch returned:', animals.length, 'animals');
    
    if (animals.length === 0 && !this.didRetryEmpty) {
      this.didRetryEmpty = true;
      console.log('Retrying after 250ms...');

      await new Promise(r => setTimeout(r, 250));

      if (seq !== this.loadSeq) return;

      const animalsRetry = await this.favorites.listAnimals();
      console.log('Retry fetch returned:', animalsRetry.length, 'animals');
      if (seq === this.loadSeq) {
        this.favoriteAnimals = animalsRetry;
        this.cdr.detectChanges();  // Add this
      }
      return;
    }

    this.didRetryEmpty = false;

    if (seq === this.loadSeq) {
      console.log('Setting favoriteAnimals to:', animals.length, 'animals');
      this.favoriteAnimals = animals;
      this.cdr.detectChanges();  // Add this
    }
  } catch (e: any) {
    console.log('Error loading favorites:', e);
    if (seq === this.loadSeq) {
      this.favoritesError = e?.message || 'Failed to load favorites';
      this.favoriteAnimals = [];
      this.cdr.detectChanges();  // Add this
    }
  } finally {
    if (seq === this.loadSeq) {
      console.log('Setting loadingFavorites to false');
      this.loadingFavorites = false;
      this.cdr.detectChanges();  // Add this
    }
  }
}
}