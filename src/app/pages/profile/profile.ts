import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase-service';
import { SystemMessageService } from '../../core/services/system-message-service';
import { ConfirmDeleteModal } from '../../shared/components/confirm-delete-modal/confirm-delete-modal';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../core/services/seo-service';

@Component({
  selector: 'app-profile',
  imports: [LucideAngularModule, FormsModule, ConfirmDeleteModal],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private supabase = inject(SupabaseService);
  private systemMessageService = inject(SystemMessageService);
  private router = inject(Router);

  profile = this.supabase.profile;
  userEmail = computed(() => this.supabase.profile()?.email);

  avatarUrl = computed(() => this.supabase.profile()?.avatar_url ?? null);
  avatarError = signal(false);

  username = '';
  loading = signal(false);
  deleteAccountModalVisible = signal(false);

  private usernameInitialized = false;
  constructor() {
    inject(SeoService).setPage({ title: 'Mi perfil', noIndex: true });
    effect(() => {
      const p = this.supabase.profile();
      if (p && !this.usernameInitialized) {
        this.username = p.username ?? '';
        this.usernameInitialized = true;
      }
    });
  }

  async updateProfile() {
    this.loading.set(true);
    try {
      const { error } = await this.supabase.updateProfile({
        username: this.username,
        avatar_url: this.avatarUrl() || '',
      });
      if (error) throw error;
      this.systemMessageService.showMessage('¡Perfil actualizado con éxito!', false);
    } catch (e: any) {
      this.systemMessageService.showMessage(e.message || 'Error al actualizar', true);
    } finally {
      this.loading.set(false);
    }
  }

  async uploadAvatar(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.loading.set(true);
    try {
      const publicUrl = await this.supabase.uploadAvatar(file);
      this.avatarError.set(false);
      const { error } = await this.supabase.updateProfile({
        username: this.username,
        avatar_url: publicUrl,
      });
      if (error) throw error;
      this.systemMessageService.showMessage('¡Foto actualizada!', false);
    } catch (e: any) {
      this.systemMessageService.showMessage(e.message || 'Error al subir imagen', true);
    } finally {
      this.loading.set(false);
    }
  }

  async confirmDeleteAccount() {
    this.loading.set(true);
    try {
      await this.supabase.deleteAccount();
      this.router.navigate(['/']);
    } catch (e: any) {
      this.systemMessageService.showMessage(e.message || 'Error al eliminar la cuenta', true);
    } finally {
      this.loading.set(false);
      this.deleteAccountModalVisible.set(false);
    }
  }
}
