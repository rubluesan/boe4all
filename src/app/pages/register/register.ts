import { Component, inject, signal, computed } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase-service';
import { Router, RouterLink } from '@angular/router';
import { FormField, email, form, required, validate } from '@angular/forms/signals';
import { LoginData } from '../../core/models/auth/login-data';
import { SystemMessageService } from '../../core/services/system-message-service';
import { LucideAngularModule } from 'lucide-angular';
import { SeoService } from '../../core/services/seo-service';

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
  constructor() { inject(SeoService).setPage({ title: 'Crear cuenta', noIndex: true }); }
  loading = signal(false);

  showPassword = signal(false);
  showRepassword = signal(false);

  // Tracked separately to reactively display the requirements checklist
  rawPassword = signal('');

  passwordRequirements = computed(() => {
    const pwd = this.rawPassword();
    return {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
    };
  });

  loginModel = signal<LoginData>({
    email: '',
    password: '',
    repassword: '',
  });

  registerForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'El email es obligatorio' });
    email(schemaPath.email, { message: 'Introduzca un email válido' });

    required(schemaPath.password, { message: 'La contraseña es obligatoria' });
    validate(schemaPath.password, ({ value }) => {
      const pwd = value();
      if (!pwd) return null;
      const valid = pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd);
      return valid ? null : {
        kind: 'weakPassword',
        message: 'La contraseña no cumple los requisitos mínimos de seguridad',
      };
    });

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

  onPasswordInput(event: Event) {
    this.rawPassword.set((event.target as HTMLInputElement).value);
  }

  async handleRegister() {
    this.loading.set(true);
    const data = this.registerForm().value();

    if (this.registerForm().invalid()) {
      this.systemMessageService.showMessage(
        'Revisa los campos del formulario antes de continuar.',
        true,
        'invalid_register_form',
      );
      this.loading.set(false);
      return;
    }

    try {
      const { error } = await this.supabase.signUp(data.email, data.password);

      if (error) throw error;

      sessionStorage.setItem('pendingConfirmEmail', data.email);
      this.router.navigate(['/check-email'], { state: { email: data.email } });
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
