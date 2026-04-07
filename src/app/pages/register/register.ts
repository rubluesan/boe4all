import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase-service';
import { Router } from '@angular/router';
import { FormField, email, form, required, validate } from '@angular/forms/signals';
import { LoginData } from '../../core/models/auth/login-data';
import { ToastService } from '../../core/services/toast-services';

@Component({
  selector: 'app-register',
  imports: [FormField],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private toastService = inject(ToastService);
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
    required(schemaPath.repassword, { message: 'Debes confirmar la contraseña' });

    validate(schemaPath.repassword, ({ value, valueOf }) => {
      const confirm = value();
      const password = valueOf(schemaPath.password);
      if (confirm !== password && confirm.length) {
        return {
          kind: 'passwordMismatch',
          message: 'Las contraseñas no coinciden',
        };
      }
      return null;
    });
  });
  /**
   * Procesa el registro del usuario llamando al método correspondiente de SupabaseService
   */
  async handleRegister() {
    this.loading.set(true);
    this.message.set('');
    const data = this.loginForm().value();
    if (this.loginForm().invalid()) {
      this.toastService.showMessage(
        'Hay campos inválidos. Por favor, revise el email y contraseña introducidos.',
        true,
      );
      return;
    }
    try {
      const { error } = await this.supabase.signUp(data.email, data.password); // Intenta crear cuenta

      if (error) throw error;

      this.message.set('¡Registro completado! Ya puedes entrar.');
      this.router.navigate(['/home']);
      // posible redirección a login o home: this.router.navigate(['/home']);
    } catch (e: any) {
      this.message.set(e.message || 'Error en el registro');
    } finally {
      this.loading.set(false);
    }
  }
}
