import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SupabaseService } from '../../core/services/supabase-service';
import { SystemMessageService } from '../../core/services/system-message-service';
import { SeoService } from '../../core/services/seo-service';

@Component({
  selector: 'app-auth-confirm',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './auth-confirm.html',
  styleUrl: './auth-confirm.css',
})
export class AuthConfirm implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supabase = inject(SupabaseService);
  private systemMessage = inject(SystemMessageService);
  constructor() { inject(SeoService).setPage({ title: 'Confirmando acceso', noIndex: true }); }

  status = signal<'loading' | 'success' | 'error'>('loading');
  errorMessage = signal('El enlace no es válido o ha caducado.');

  async ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');

    if (!code) {
      // No hay código PKCE: comprobamos si ya hay sesión activa (flujo implícito)
      const hasSession = await this.supabase.authReady();
      if (hasSession) {
        this.onSuccess();
      } else {
        this.status.set('error');
      }
      return;
    }

    try {
      const { error } = await this.supabase.exchangeConfirmCode(code);
      if (error) throw error;
      sessionStorage.removeItem('pendingConfirmEmail');
      this.onSuccess();
    } catch (e: any) {
      this.errorMessage.set(e.message || 'El enlace no es válido o ha caducado.');
      this.status.set('error');
    }
  }

  private onSuccess() {
    this.status.set('success');
    this.systemMessage.showMessage('¡Cuenta verificada! Bienvenido a BOE4ALL.', false);
    setTimeout(() => this.router.navigate(['/home']), 1800);
  }
}
