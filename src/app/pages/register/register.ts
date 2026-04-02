import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false); // Estado para mostrar el spinner en el botón
  message = signal(''); // Mensaje para el usuario (éxito o error)

  /**
   * Procesa el registro del usuario llamando al método correspondiente de SupabaseService
   */
  async handleRegister() {
    this.loading.set(true);
    this.message.set('');

    try {
      const { error } = await this.supabase.signUp(this.email, this.password); // Intenta crear cuenta

      if (error) throw error;

      this.message.set('¡Registro completado! Ya puedes entrar.');
      // posible redirección a login o home: this.router.navigate(['/home']);
    } catch (e: any) {
      this.message.set(e.message || 'Error en el registro');
    } finally {
      this.loading.set(false);
    }
  }
}
