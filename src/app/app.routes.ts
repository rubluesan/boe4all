import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

export const routes: Routes = [
    { path: '', component: Landing },
    { path: '*', component: Landing },
    { path: 'home', component: Home},
    { path: 'login',component:Login},
    { path:'register', component: Register},
];
