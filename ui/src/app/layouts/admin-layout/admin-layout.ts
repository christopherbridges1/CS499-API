// Angular admin layout component
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../shared/header';

// Admin layout component definition
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
// Admin layout component class
export class AdminLayout { }
