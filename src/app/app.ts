import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarShow } from './shared/components/navbar-show/navbar-show';
import { Footer } from './shared/components/footer/footer';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarShow, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('boe4all');
}
