import { Injectable, signal, OnDestroy, inject } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/UserProfile';
import { SystemMessageService } from './system-message-service';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService implements OnDestroy {
  // Inicialización del cliente de Supabase usando la URL y la publishable Key
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl || '',
    environment.supabaseKey || '',
  );

  systemMessageService = inject(SystemMessageService);

  // Signals para manejar el estado
  user = signal<User | null>(null);
  profile = signal<UserProfile | null>(null);
  initialized = signal(false);

  // Booleano para evitar múltiples solicitudes simultáneas de perfil
  private profileRequestPending = false;
  private authSubscription: any;

  // Inicialización de la autenticación al instanciar el servicio
  constructor() {
    this.initAuth();
  }

  ngOnDestroy() {
    // Limpieza de la suscripción al destruir el servicio
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async authReady(): Promise<boolean> {
    const { data } = await this.supabase.auth.getSession();
    return !!data?.session;
  }

  /**
   * Configura la escucha de cambios en la autenticación.
   * Supabase maneja la persistencia de la sesión automáticamente en localStorage.
   */
  private initAuth() {
    // 1. Comprobamos si ya existe una sesión activa al cargar la app
    this.supabase.auth.getUser().then(({ data }) => {
      setTimeout(() => {
        const currentUser = data?.user ?? null;
        this.user.set(currentUser);
        if (currentUser) {
          this.refreshProfile();
        } else {
          this.initialized.set(true);
        }
      });
    });

    // 2. Escuchamos eventos de login, logout o cambios en el token
    const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
      this.authSubscription = data.subscription;
      const currentUser = this.user();
      const newUser = session?.user ?? null;

      // Al cerrar sesión, limpiamos el estado local
      if (event === 'SIGNED_OUT') {
        setTimeout(() => {
          this.user.set(null);
          this.profile.set(null);
          this.initialized.set(true);
        });
        return;
      }

      // Si el ID de usuario cambia, actualizamos el estado y cargamos su perfil
      if (newUser?.id !== currentUser?.id) {
        setTimeout(() => {
          this.user.set(newUser);
          if (newUser) {
            this.refreshProfile();
          } else {
            this.profile.set(null);
            this.initialized.set(true);
          }
        });
      }
    });
  }

  /**
   * Acceso directo al cliente de Supabase para consultas personalizadas
   */
  getClient() {
    return this.supabase;
  }

  /**
   * Métodos de autenticación estándar - registro e inicio de sesión
   * Al registrarse, Supabase crea el usuario en 'auth.users'
   * y el Trigger de DB crea automáticamente el perfil en 'public.profiles'
   */
  // registro con email y contraseña
  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({
      email,
      password,
    });
  }

  // inicio de sesión con email y contraseña
  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  // cierre de sesión
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error: any) {
      this.systemMessageService.showMessage(error?.message || 'Error al cerrar sesión', true);
    }

    this.systemMessageService.showMessage('Sesión cerrada correctamente', false);
  }

  /**
   * Carga o actualiza los datos del perfil desde la tabla 'public.profiles'.
   * Esta tabla está protegida por RLS (Row Level Security).
   */
  async refreshProfile() {
    if (this.profileRequestPending) return;

    const user = this.user();
    if (!user) return;

    this.profileRequestPending = true;
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        this.profile.set(data);
      }
    } catch (e) {
      console.warn('No se pudo cargar el perfil del usuario (posible trigger en curso):', e);
    } finally {
      this.profileRequestPending = false;
      this.initialized.set(true);
    }
  }

  async updateProfile(updates: { username: string; avatar_url: string }) {
    const user = this.user();
    if (!user) throw new Error('No user logged in');

    // Solo el dueño puede actualizar su propio perfil debido a las políticas RLS
    const res = await this.supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('id', user.id);

    await this.refreshProfile();
    return res;
  }

  /**
   * Sube una imagen al Bucket de 'avatars' en Supabase Storage
   */
  async uploadAvatar(file: File) {
    const user = this.user();
    if (!user) throw new Error('No user logged in');

    /*Estaría bien comprimir y escalar la imagen antes de subirla para optimizar 
    el almacenamiento y la entrega, pero lo dejamos para futuras mejoras */
    //const compressedBlob = await this.compressImage(file, 400, 400);
    const fileExt = 'webp';
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Obtenemos la URL pública para mostrar la imagen
    const { data } = this.supabase.storage.from('avatars').getPublicUrl(filePath);

    // Optimizamos la entrega usando el servicio de transformación de imágenes de Supabase
    return data.publicUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  }
}
