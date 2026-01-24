import { Routes } from '@angular/router';

// Layouts
import { CustomerLayout } from './layouts/customer-layout/customer-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

// Customer pages
import { Home } from './pages/home/home';
import { Browse } from './pages/browse/browse';
import { CustomerLogin } from './pages/customer-login/customer-login';

// Admin pages
import { Login } from './pages/login/login';               
import { Animals } from './pages/animals/animals';
import { adminGuard } from './services/admin-guard';

export const routes: Routes = [
  // CUSTOMER SITE
  {
    path: '',
    component: CustomerLayout,
    children: [
      { path: '', component: Home },
      { path: 'browse', component: Browse },
      { path: 'customer/login', component: CustomerLogin },
      { path: 'customer/register', loadComponent: () => import('./pages/customer-register/customer-register').then(m => m.CustomerRegister) }
    ]
  },

  // ADMIN SITE
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'animals', component: Animals, canActivate: [adminGuard] },
      { path: '', redirectTo: 'animals', pathMatch: 'full' },
    ]
  },

  { path: '**', redirectTo: '' }
];