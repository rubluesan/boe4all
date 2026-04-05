import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase-service';
@Component({
  selector: 'app-navbar-show',
  imports: [RouterLink],
  templateUrl: './navbar-show.html',
  styleUrl: './navbar-show.css',
})
export class NavbarShow {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  logout() {
    this.supabase.signOut();
    this.router.navigate(['/landing']);
  }
}
