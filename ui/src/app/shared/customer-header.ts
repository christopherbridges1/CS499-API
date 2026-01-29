// Component for the customer header section of the application.
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CustomerAuth } from '../services/customer-auth';
import { Favorites } from '../services/favorites';

// Customer header component definition
@Component({
  selector: 'app-customer-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './customer-header.html',
  styleUrls: ['./customer-header.css']
})
// Customer header component class
export class CustomerHeader {
  // Constructor with dependencies
  constructor(public auth: CustomerAuth, public fav: Favorites) { }
}
