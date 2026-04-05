import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase-service';
import { Router } from '@angular/router';
import { FormField, email, form, required } from '@angular/forms/signals';
import { LoginData } from '../../core/models/login-data';

@Component({
  selector: 'app-register',
  imports: [FormField],
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

  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'El email es obligatorio' });
    email(schemaPath.email, { message: 'Introduzca un email válido' });

    required(schemaPath.password, { message: 'La contraseña es obligatoria' });
  });
  /**
   * Procesa el registro del usuario llamando al método correspondiente de SupabaseService
   */
  async handleRegister() {
    this.loading.set(true);
    this.message.set('');
    const data = this.loginForm().value();

    try {
      const { error } = await this.supabase.signUp(data.email, data.password); // Intenta crear cuenta

      if (error) throw error;

      this.message.set('¡Registro completado! Ya puedes entrar.');
      console.log('hola');
      this.router.navigate(['/home']);
      // posible redirección a login o home: this.router.navigate(['/home']);
    } catch (e: any) {
      this.message.set(e.message || 'Error en el registro');
    } finally {
      this.loading.set(false);
    }
  }
}
