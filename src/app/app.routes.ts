import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { guardedRoutesGuard } from './core/guards/guarded-routes-guard';
import { Disposition } from './pages/disposition/disposition';

export const routes: Routes = [
  { path: '', component: Landing, data: { breadcrumb: 'LandingPage' } },
  { path: '*', component: Landing, data: { breadcrumb: 'LandingPage' } },
  { path: 'landing', component: Landing,  data: { breadcrumb: 'LandingPage' } },
  { path: 'home', component: Home, canActivate: [guardedRoutesGuard], data: { breadcrumb: 'Home' } },
  { path: 'login', component: Login, data: { breadcrumb: 'Login' } },
  { path: 'register', component: Register, data: { breadcrumb: 'Register' } },
  { path: 'disposiciones', component: Disposition, canActivate: [guardedRoutesGuard], data: { breadcrumb: 'Disposiciones' } },
];
