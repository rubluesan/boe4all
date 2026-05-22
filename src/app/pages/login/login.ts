import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase-service';
import { Router, RouterLink } from '@angular/router';
import { FormField, email, form, required } from '@angular/forms/signals';
import { LoginData } from '../../core/models/auth/login-data';
import { LucideAngularModule } from 'lucide-angular';
import { SystemMessageService } from '../../core/services/system-message-service';
@Component({
  selector: 'app-login',
  imports: [FormField, LucideAngularModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private systemMessageService = inject(SystemMessageService);

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
    if (this.loginForm().invalid()) {
      this.systemMessageService.showMessage(
        'Hay campos inválidos. Por favor, revise el email y contraseña introducidos.',
        true,
        'invalid_login_form',
      );
      this.loading.set(false);
      return;
    }
    try {
      const { error } = await this.supabase.signIn(data.email, data.password); // Intenta iniciar sesión

      if (error) throw error;

      this.systemMessageService.showMessage('Sesión iniciada correctamente', false);
      this.router.navigate(['/home']); // Redirige al Home después de login exitoso
    } catch (e: any) {
      this.systemMessageService.showMessage(
        e.message || 'Error en la autenticación',
        true,
        'login_failed',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
