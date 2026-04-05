import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/UserProfile';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  // Inicialización del cliente de Supabase usando la URL y la publishable Key
  private supabase: SupabaseClient = createClient(
    environment.supabaseUrl || '',
    environment.supabaseKey || '',
  );

  // Signals para manejar el estado
  user = signal<User | null>(null);
  profile = signal<UserProfile | null>(null);
  initialized = signal(false);

  // Booleano para evitar múltiples solicitudes simultáneas de perfil
  private profileRequestPending = false;

  // Inicialización de la autenticación al instanciar el servicio
  constructor() {
    this.initAuth();
  }

  /**
   * Configura la escucha de cambios en la autenticación.
   * Supabase maneja la persistencia de la sesión automáticamente en localStorage.
   */
  private initAuth() {
    // 1. Comprobamos si ya existe una sesión activa al cargar la app
    this.supabase.auth.getUser().then(({ data }) => {
      setTimeout(() => {
        this.user.set(data.user);
        if (data.user) {
          this.refreshProfile();
        } else {
          this.initialized.set(true);
        }
      });
    });

    // 2. Escuchamos eventos de login, logout o cambios en el token
    this.supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = this.user();
      const newUser = session?.user ?? null;

      // Al cerrar sesión, limpiamos el estado local
      if (event === 'SIGNED_OUT') {
        setTimeout(() => {
          this.user.set(null);
          this.profile.set(null);
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
    await this.supabase.auth.signOut();
    this.profile.set(null);
    this.user.set(null);
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
      // Error silencioso (ej. si el perfil aún no se ha creado por el trigger)
    } finally {
      this.profileRequestPending = false;
      this.initialized.set(true);
    }
  }
}
