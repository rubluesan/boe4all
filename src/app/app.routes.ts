import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { CheckEmail } from './pages/check-email/check-email';
import { AuthConfirm } from './pages/auth-confirm/auth-confirm';
import { guardedRoutesGuard } from './core/guards/guarded-routes-guard';
import { Disposition } from './pages/disposition/disposition';
import { Summary } from './pages/summary/summary';
import { Profile } from './pages/profile/profile';
import { MyBoe } from './pages/my-boe/my-boe';
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
    path: 'mi-boe',
    component: MyBoe,
    canActivate: [guardedRoutesGuard],
    data: { breadcrumb: 'Mi BOE', showBreadcrumbs: true },
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
  { path: 'check-email', component: CheckEmail },
  { path: 'auth/confirm', component: AuthConfirm },
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
