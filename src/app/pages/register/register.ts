import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase-service';
import { Router, RouterLink } from '@angular/router';
import { FormField, email, form, required, validate } from '@angular/forms/signals';
import { LoginData } from '../../core/models/auth/login-data';
import { SystemMessageService } from '../../core/services/system-message-service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-register',
  imports: [FormField, LucideAngularModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private systemMessageService = inject(SystemMessageService);
  loading = signal(false); // Estado para mostrar el spinner en el botón

  loginModel = signal<LoginData>({
    email: '',
    password: '',
    repassword: '',
  });

  registerForm = form(this.loginModel, (schemaPath) => {
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
    const data = this.registerForm().value();

    if (this.registerForm().invalid()) {
      this.systemMessageService.showMessage(
        'Hay campos inválidos. Por favor, revise el email y contraseña introducidos.',
        true,
        'invalid_register_form',
      );
      this.loading.set(false);
      return;
    }

    try {
      const { error } = await this.supabase.signUp(data.email, data.password); // Intenta crear cuenta

      if (error) throw error;

      this.systemMessageService.showMessage('¡Registro completado! Ya puedes entrar.', false);
      this.router.navigate(['/home']);
      // posible redirección a login o home: this.router.navigate(['/home']);
    } catch (e: any) {
      this.systemMessageService.showMessage(
        e.message || 'Error en el registro',
        true,
        'register_failed',
      );
    } finally {
      this.loading.set(false);
    }
  }
}
