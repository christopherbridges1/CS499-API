// Customer layout in Angular
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CustomerHeader } from '../../shared/customer-header';

// Customer layout component definition
@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterOutlet, CustomerHeader],
  templateUrl: './customer-layout.html',
  styleUrls: ['./customer-layout.css']
})
// Customer layout component class
export class CustomerLayout { }
