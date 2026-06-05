import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase-service';

export interface SavedDisposition {
  id: string;
  boe_id: string;
  titulo: string;
  fecha: string;
  url_pdf: string;
  url_html: string;
  created_at: string;
}

export interface SavedSummary {
  id: string;
  boe_id: string;
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  boe_id: string;
  titulo: string;
  url_pdf: string;
  url_html: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private supabase = inject(SupabaseService);

  // ------------------------------------------------------------------ //
  // Disposiciones guardadas
  // ------------------------------------------------------------------ //

  async saveDisposition(data: {
    boe_id: string;
    titulo: string;
    fecha: string;
    url_pdf: string;
    url_html: string;
  }): Promise<void> {
    const user = this.supabase.user();
    if (!user) throw new Error('No autenticado');

    const { error } = await this.supabase
      .getClient()
      .from('saved_dispositions')
      .upsert({ ...data, user_id: user.id }, { onConflict: 'user_id,boe_id' });

    if (error) throw new Error(error.message);
  }

  async getSavedDispositions(): Promise<SavedDisposition[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('saved_dispositions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async deleteSavedDisposition(boeId: string): Promise<void> {
    const user = this.supabase.user();
    if (!user) throw new Error('No autenticado');

    const { error } = await this.supabase
      .getClient()
      .from('saved_dispositions')
      .delete()
      .eq('user_id', user.id)
      .eq('boe_id', boeId);

    if (error) throw new Error(error.message);
  }

  async isDispositionSaved(boeId: string): Promise<boolean> {
    const user = this.supabase.user();
    if (!user) return false;

    const { data } = await this.supabase
      .getClient()
      .from('saved_dispositions')
      .select('id')
      .eq('user_id', user.id)
      .eq('boe_id', boeId)
      .maybeSingle();

    return !!data;
  }

  // ------------------------------------------------------------------ //
  // Resúmenes
  // ------------------------------------------------------------------ //

  async saveSummary(boeId: string, content: string): Promise<string> {
    const user = this.supabase.user();
    if (!user) throw new Error('No autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('summaries')
      .insert({ boe_id: boeId, user_id: user.id, content })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return data.id as string;
  }

  async getSummariesForDisposition(boeId: string): Promise<SavedSummary[]> {
    const user = this.supabase.user();
    if (!user) return [];

    const { data } = await this.supabase
      .getClient()
      .from('summaries')
      .select('id, boe_id, content, created_at')
      .eq('user_id', user.id)
      .eq('boe_id', boeId)
      .order('created_at', { ascending: false });

    return (data as SavedSummary[]) ?? [];
  }

  async deleteSummaryById(id: string): Promise<void> {
    const user = this.supabase.user();
    if (!user) throw new Error('No autenticado');

    const { error } = await this.supabase
      .getClient()
      .from('summaries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
  }

  async getSavedSummaries(): Promise<SavedSummary[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('summaries')
      .select('id, boe_id, content, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data as SavedSummary[]) ?? [];
  }

  // ------------------------------------------------------------------ //
  // Sesiones de chat
  // ------------------------------------------------------------------ //

  async getSessionsForDisposition(boeId: string): Promise<ChatSession[]> {
    const user = this.supabase.user();
    if (!user) return [];

    const { data } = await this.supabase
      .getClient()
      .from('chat_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('boe_id', boeId)
      .order('updated_at', { ascending: false });

    return (data as ChatSession[]) ?? [];
  }

  async createNewChatSession(
    boeId: string,
    titulo: string,
    urlPdf: string,
    urlHtml: string,
  ): Promise<string> {
    const user = this.supabase.user();
    if (!user) throw new Error('No autenticado');

    const { data, error } = await this.supabase
      .getClient()
      .from('chat_sessions')
      .insert({ user_id: user.id, boe_id: boeId, titulo, url_pdf: urlPdf, url_html: urlHtml })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return data.id as string;
  }

  async getExistingChatSession(boeId: string): Promise<string | null> {
    const user = this.supabase.user();
    if (!user) return null;

    const { data } = await this.supabase
      .getClient()
      .from('chat_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('boe_id', boeId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return data?.id ?? null;
  }

  async getOrCreateChatSession(
    boeId: string,
    titulo: string,
    urlPdf: string,
    urlHtml: string,
  ): Promise<string> {
    const user = this.supabase.user();
    if (!user) throw new Error('No autenticado');

    const { data: existing } = await this.supabase
      .getClient()
      .from('chat_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('boe_id', boeId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) return existing.id as string;

    const { data, error } = await this.supabase
      .getClient()
      .from('chat_sessions')
      .insert({ user_id: user.id, boe_id: boeId, titulo, url_pdf: urlPdf, url_html: urlHtml })
      .select('id')
      .single();

    if (error) throw new Error(error.message);
    return data.id as string;
  }

  async saveChatMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from('chat_messages')
      .insert({ session_id: sessionId, role, content });

    if (error) throw new Error(error.message);

    await this.supabase
      .getClient()
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);
  }

  async getChatMessages(
    sessionId: string,
  ): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
    const { data } = await this.supabase
      .getClient()
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    return (data as { role: 'user' | 'assistant'; content: string }[]) ?? [];
  }

  async getChatSessions(): Promise<ChatSession[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('chat_sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    const user = this.supabase.user();
    if (!user) throw new Error('No autenticado');

    const { error } = await this.supabase
      .getClient()
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);
  }
}
