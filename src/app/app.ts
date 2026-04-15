import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarShow } from './shared/components/navbar-show/navbar-show';
import { Footer } from './shared/components/footer/footer';
import { NotificationToast } from './shared/components/notification-toast/notification-toast';
import { SystemMessageService } from './core/services/system-message-service';
import { BreadcrumbComponent } from './shared/components/breadcrumbs/breadcrumbs';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarShow, Footer, NotificationToast, BreadcrumbComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('boe4all');
  systemMessageService = inject(SystemMessageService);
}
