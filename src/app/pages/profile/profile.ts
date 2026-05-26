import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase-service';
import { SystemMessageService } from '../../core/services/system-message-service';
import { UserProfile } from '../../core/models/UserProfile';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [LucideAngularModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private supabase = inject(SupabaseService);
  private systemMessageService = inject(SystemMessageService);

  profile = signal<UserProfile | null>(null);
  userEmail = signal<string | undefined>('');
  avatarUrl = signal<string | null>(null);
  username = '';
  loading = signal(false);
  avatarError = signal(false);

  async ngOnInit() {
    this.profile.set(this.supabase.profile() || null);
    this.userEmail.set(this.supabase.profile()?.email);
    this.avatarUrl.set(this.supabase.profile()?.avatar_url || null);
    this.username = this.supabase.profile()?.username || '';
  }

  async updateProfile() {
    this.loading.set(true);
    try {
      console.log(this.username + ' ' + this.avatarUrl());
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
      this.avatarUrl.set(publicUrl);
      this.avatarError.set(false);
      await this.updateProfile();
    } catch (e: any) {
      this.systemMessageService.showMessage(e.message || 'Error al subir imagen', true);
    } finally {
      this.loading.set(false);
    }
  }
}
