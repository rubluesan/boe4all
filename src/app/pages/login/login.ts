import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false); // Estado para mostrar el spinner en el botón
  message = signal(''); // Mensaje para el usuario (éxito o error)

  /**
   * Procesa el inicio de sesión del usuario llamando al método correspondiente de SupabaseService
   */
  async handleLogin() {
    this.loading.set(true);
    this.message.set('');

    try {
      const { error } = await this.supabase.signIn(this.email, this.password); // Intenta iniciar sesión

      if (error) throw error;

      this.router.navigate(['/home']); // Redirige al Home después de login exitoso
    } catch (e: any) {
      this.message.set(e.message || 'Error en la autenticación');
    } finally {
      this.loading.set(false);
    }
  }
}
