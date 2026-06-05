import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase-service';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable({ providedIn: 'root' })
export class AiService {
  private supabase = inject(SupabaseService);

  async generateSummary(boeId: string): Promise<string> {
    const { data, error } = await this.supabase
      .getClient()
      .functions.invoke('generate-summary', { body: { boe_id: boeId } });

    if (error) throw new Error(error.message);
    if (!data?.summary) throw new Error('No se recibió respuesta del servidor de IA');

    return data.summary as string;
  }

  async chat(boeId: string, messages: ChatMessage[]): Promise<string> {
    const { data, error } = await this.supabase
      .getClient()
      .functions.invoke('chat-with-disposition', { body: { boe_id: boeId, messages } });

    if (error) throw new Error(error.message);
    if (!data?.response) throw new Error('No se recibió respuesta del servidor de IA');

    return data.response as string;
  }
}
