import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase-service';
import { Router, RouterLink } from '@angular/router';
import { FormField, email, form, required } from '@angular/forms/signals';
import { LoginData } from '../../core/models/auth/login-data';
import { LucideAngularModule } from 'lucide-angular';
@Component({
  selector: 'app-login',
  imports: [FormField, LucideAngularModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  loading = signal(false); // Estado para mostrar el spinner en el botón
  message = signal(''); // Mensaje para el usuario (éxito o error)

  loginModel = signal<LoginData>({
    email: '',
    password: '',
    repassword: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'El email es obligatorio' });
    email(schemaPath.email, { message: 'Introduzca un email válido' });

    required(schemaPath.password, { message: 'La contraseña es obligatoria' });
  });
  /**
   * Procesa el inicio de sesión del usuario llamando al método correspondiente de SupabaseService
   */
  async handleLogin() {
    this.loading.set(true);
    this.message.set('');
    const data = this.loginForm().value();
    try {
      const { error } = await this.supabase.signIn(data.email, data.password); // Intenta iniciar sesión

      if (error) throw error;

      this.router.navigate(['/home']); // Redirige al Home después de login exitoso
    } catch (e: any) {
      this.message.set(e.message || 'Error en la autenticación');
    } finally {
      this.loading.set(false);
    }
  }
}
