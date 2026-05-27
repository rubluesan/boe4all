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
  { path: '', component: Landing },
  { path: 'landing', component: Landing },
  {
    path: 'home',
    component: Home,
    canActivate: [guardedRoutesGuard],
    data: { breadcrumb: 'Home', showBreadcrumbs: true },
  },
  {
    path: 'login',
    component: Login,
    canActivate: [publicRoutesGuard],
  },
  {
    path: 'register',
    component: Register,
    canActivate: [publicRoutesGuard],
  },
  {
    path: 'sumario/:fecha',
    data: { breadcrumb: 'Sumario {fecha}', showBreadcrumbs: true },
    canActivate: [guardedRoutesGuard],
    children: [
      {
        path: '',
        component: Summary,
      },
      {
        path: 'disposicion/:id',
        component: Disposition,
        canActivate: [guardedRoutesGuard],
        data: { breadcrumb: 'Disposicion {id}', showBreadcrumbs: true },
      },
    ],
  },

  {
    path: 'profile',
    component: Profile,
    canActivate: [guardedRoutesGuard],
  },
  { path: '**', component: Landing },
];
