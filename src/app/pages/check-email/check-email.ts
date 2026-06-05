import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SupabaseService } from '../../core/services/supabase-service';
import { SystemMessageService } from '../../core/services/system-message-service';
import { SeoService } from '../../core/services/seo-service';

@Component({
  selector: 'app-check-email',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './check-email.html',
  styleUrl: './check-email.css',
})
export class CheckEmail {
  private supabase = inject(SupabaseService);
  private systemMessage = inject(SystemMessageService);

  email = signal('');
  resending = signal(false);
  resent = signal(false);

  constructor() {
    inject(SeoService).setPage({ title: 'Verifica tu email', noIndex: true });
    const state = window.history.state as { email?: string };
    const stateEmail = state?.email || '';
    const storedEmail = sessionStorage.getItem('pendingConfirmEmail') || '';
    this.email.set(stateEmail || storedEmail);
  }

  async resendEmail() {
    const emailVal = this.email();
    if (!emailVal || this.resending() || this.resent()) return;

    this.resending.set(true);
    try {
      const { error } = await this.supabase.resendConfirmationEmail(emailVal);
      if (error) throw error;
      this.resent.set(true);
      this.systemMessage.showMessage('Email de confirmación reenviado', false);
    } catch (e: any) {
      this.systemMessage.showMessage(e.message || 'Error al reenviar el email', true);
    } finally {
      this.resending.set(false);
    }
  }
}
