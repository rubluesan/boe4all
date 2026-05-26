import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { guardedRoutesGuard } from './core/guards/guarded-routes-guard';
import { Disposition } from './pages/disposition/disposition';
import { Summary } from './pages/summary/summary';
import { Profile } from './pages/profile/profile';
import { publicRoutesGuard } from './core/guards/public-guard';
export const routes: Routes = [
  { path: '', component: Landing, data: { breadcrumb: 'LandingPage' } },
  { path: 'landing', component: Landing, data: { breadcrumb: 'LandingPage' } },
  {
    path: 'home',
    component: Home,
    canActivate: [guardedRoutesGuard],
    data: { breadcrumb: 'Home' },
  },
  {
    path: 'login',
    component: Login,
    canActivate: [publicRoutesGuard],
    data: { breadcrumb: 'Login' },
  },
  {
    path: 'register',
    component: Register,
    canActivate: [publicRoutesGuard],
    data: { breadcrumb: 'Register' },
  },
  {
    path: 'disposicion/:id',
    component: Disposition,
    canActivate: [guardedRoutesGuard],
    data: { breadcrumb: 'Disposicion' },
  },
  {
    path: 'sumario/:fecha',
    component: Summary,
    canActivate: [guardedRoutesGuard],
    data: { breadcrumb: 'Sumario' },
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [guardedRoutesGuard],
    data: { breadcrumb: 'Profile' },
  },
  { path: '**', component: Landing, data: { breadcrumb: 'LandingPage' } },
];
