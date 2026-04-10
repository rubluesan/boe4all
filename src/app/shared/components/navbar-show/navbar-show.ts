import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase-service';
import { LucideAngularModule } from 'lucide-angular';
import { A11yModule } from '@angular/cdk/a11y';
import { UserMenu } from '../user-menu/user-menu';

@Component({
  selector: 'app-navbar-show',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, A11yModule, UserMenu],
  templateUrl: './navbar-show.html',
  styleUrl: './navbar-show.css',
})
export class NavbarShow {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  userLoggedIn = computed(() => !!this.supabase.user());
  mobileNavIsOpen = signal(false);

  // ngOnInit(): void {
  //   this.userLoggedIn.set(this.authService.isLoggedIn());
  // }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.mobileNavIsOpen()) {
      this.toggleMenu();
    }
  }

  toggleMenu() {
    const open = !this.mobileNavIsOpen();
    this.mobileNavIsOpen.set(open);

    // Bloquear scroll de la página cuando el menú está abierto
    document.body.style.overflow = open ? 'hidden' : '';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  logout() {
    this.supabase.signOut();
    this.router.navigate(['/landing']);
  }
}
