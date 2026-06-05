import { A11yModule } from '@angular/cdk/a11y';
import { Component, ElementRef, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BoeItem } from '../../core/models/BoeData';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { LucideAngularModule } from 'lucide-angular';
import { AiService, ChatMessage } from '../../core/services/ai-service';
import { ChatSession, HistoryService, SavedSummary } from '../../core/services/history-service';
import { SystemMessageService } from '../../core/services/system-message-service';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { marked } from 'marked';
import { SeoService } from '../../core/services/seo-service';

interface UiMessage {
  text: string;
  isUser: boolean;
  html?: SafeHtml;
  loading?: boolean;
}

@Component({
  selector: 'app-disposition',
  imports: [LucideAngularModule, RouterLink, A11yModule, TooltipDirective],
  templateUrl: './disposition.html',
  styleUrl: './disposition.css',
})
export class Disposition implements OnInit {
  private sanitizer = inject(DomSanitizer);
  private aiService = inject(AiService);
  private historyService = inject(HistoryService);
  private systemMessageService = inject(SystemMessageService);
  private elRef = inject(ElementRef);
  route = inject(ActivatedRoute);
  router = inject(Router);

  disposition = signal<BoeItem | null>(null);
  date = signal<string | null>(null);
  mensajes = signal<UiMessage[]>([]);

  // Resúmenes
  allSummaries = signal<SavedSummary[]>([]);
  activeSummaryId = signal<string | null>(null);
  activeSummary = computed<SavedSummary | null>(() => {
    const id = this.activeSummaryId();
    const all = this.allSummaries();
    return (id ? all.find((s) => s.id === id) : null) ?? all[0] ?? null;
  });
  activeSummaryHtml = computed<SafeHtml | null>(() => {
    const s = this.activeSummary();
    return s ? this.toSafeHtml(s.content) : null;
  });
  summaryLoading = signal(false);
  summaryModalVisible = signal(false);
  summaryMenuOpen = signal(false);

  // Chat
  chatLoading = signal(false);

  // Historial / sesiones
  isSaved = signal(false);
  sessionId = signal<string | null>(null);
  allSessions = signal<ChatSession[]>([]);
  sessionMenuOpen = signal(false);

  currentSessionLabel = computed(() => {
    const id = this.sessionId();
    if (!id) return 'Nueva conversación';
    const session = this.allSessions().find((s) => s.id === id);
    return session ? this.formatSessionDate(session.created_at) : 'Conversación';
  });

  pdfLoading = signal(true);

  safePdfUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.disposition()?.url_pdf?.texto;
    if (!url) return null;
    const proxyUrl = `${environment.supabaseUrl}/functions/v1/pdf-proxy?url=${encodeURIComponent(url)}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(proxyUrl);
  });

  private navNoSession = false;
  private navSessionId: string | null = null;

  constructor() {
    const currentNavigation = this.router.currentNavigation();
    if (currentNavigation?.extras.state) {
      const s = currentNavigation.extras.state;
      this.disposition.set(s['disposition'] as BoeItem);
      this.date.set(s['date'] as string);
      this.navNoSession = !!s['noSession'];
      this.navSessionId = s['sessionId'] ?? null;
    }
    const seo = inject(SeoService);
    const titulo = this.disposition()?.titulo;
    const pageTitle = titulo ? titulo.slice(0, 60) + (titulo.length > 60 ? '…' : '') : 'Disposición';
    seo.setPage({ title: pageTitle, noIndex: true });
  }

  ngOnInit() {
    const disp = this.disposition();
    if (disp) {
      this.initDisposition(disp);
    }
  }

  private async initDisposition(disp: BoeItem): Promise<void> {
    try {
      const [isSaved, summaries, sessions] = await Promise.all([
        this.historyService.isDispositionSaved(disp.identificador),
        this.historyService.getSummariesForDisposition(disp.identificador),
        this.historyService.getSessionsForDisposition(disp.identificador),
      ]);

      this.isSaved.set(isSaved);

      if (summaries.length > 0) {
        this.allSummaries.set(summaries);
        this.activeSummaryId.set(summaries[0].id);
      }

      if (sessions.length > 0) {
        this.allSessions.set(sessions);
      }

      if (!this.navNoSession && sessions.length > 0) {
        const target = this.navSessionId
          ? (sessions.find((s) => s.id === this.navSessionId) ?? sessions[0])
          : sessions[0];
        this.sessionId.set(target.id);
        const messages = await this.historyService.getChatMessages(target.id);
        if (messages.length > 0) {
          this.mensajes.set(messages.map((m) => ({
            text: m.content,
            isUser: m.role === 'user',
            html: m.role === 'assistant' ? this.toSafeHtml(m.content) : undefined,
          })));
          this.scrollToBottom();
        }
      }
    } catch {
      // no bloquea la carga si el historial falla
    }
  }

  // ---- Helpers ----

  async downloadPdf(): Promise<void> {
    const url = this.disposition()?.url_pdf?.texto;
    if (!url) return;
    const filename = url.split('/').pop() ?? `${this.disposition()!.identificador}.pdf`;
    try {
      const proxyUrl = `${environment.supabaseUrl}/functions/v1/pdf-proxy?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('fetch failed');
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, '_blank');
    }
  }

  private toSafeHtml(text: string): SafeHtml {
    const html = marked.parse(text, { async: false }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  async copyMessage(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.systemMessageService.showMessage('Copiado al portapapeles', false);
    } catch {
      this.systemMessageService.showMessage('No se pudo copiar', true);
    }
  }

  // ---- Resúmenes ----

  openSummaryModal(): void {
    if (this.allSummaries().length > 0) this.summaryModalVisible.set(true);
  }

  closeSummaryModal(): void {
    this.summaryModalVisible.set(false);
    this.summaryMenuOpen.set(false);
  }

  switchSummary(id: string): void {
    this.activeSummaryId.set(id);
    this.summaryMenuOpen.set(false);
  }

  async deleteActiveSummary(): Promise<void> {
    const summary = this.activeSummary();
    if (!summary) return;

    try {
      await this.historyService.deleteSummaryById(summary.id);
      this.allSummaries.update((list) => list.filter((s) => s.id !== summary.id));
      const remaining = this.allSummaries();
      if (remaining.length > 0) {
        this.activeSummaryId.set(remaining[0].id);
      } else {
        this.activeSummaryId.set(null);
        this.summaryModalVisible.set(false);
      }
      this.systemMessageService.showMessage('Resumen eliminado', false);
    } catch {
      this.systemMessageService.showMessage('Error al eliminar el resumen', true);
    }
  }

  async generarResumen(): Promise<void> {
    if (this.summaryLoading()) return;
    const disp = this.disposition();
    if (!disp) return;

    this.summaryLoading.set(true);
    try {
      const content = await this.aiService.generateSummary(disp.identificador);
      const id = await this.historyService.saveSummary(disp.identificador, content).catch(() => crypto.randomUUID());

      const newSummary: SavedSummary = {
        id,
        boe_id: disp.identificador,
        content,
        created_at: new Date().toISOString(),
      };

      this.allSummaries.update((list) => [newSummary, ...list]);
      this.activeSummaryId.set(id);
      this.summaryModalVisible.set(true);
    } catch (error: any) {
      this.systemMessageService.showMessage(
        error?.message || 'Error al generar el resumen',
        true,
      );
    } finally {
      this.summaryLoading.set(false);
    }
  }

  formatSummaryDate(isoDate?: string): string {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ---- Sesiones de chat ----

  private async ensureSession(): Promise<string> {
    const existing = this.sessionId();
    if (existing) return existing;

    const disp = this.disposition()!;
    const id = await this.historyService.createNewChatSession(
      disp.identificador,
      disp.titulo,
      disp.url_pdf.texto,
      disp.url_html,
    );
    this.sessionId.set(id);
    const now = new Date().toISOString();
    this.allSessions.update((sessions) => [
      { id, boe_id: disp.identificador, titulo: disp.titulo, url_pdf: disp.url_pdf.texto, url_html: disp.url_html, created_at: now, updated_at: now },
      ...sessions,
    ]);
    return id;
  }

  async switchSession(session: ChatSession): Promise<void> {
    if (session.id === this.sessionId()) {
      this.sessionMenuOpen.set(false);
      return;
    }
    this.sessionMenuOpen.set(false);
    this.sessionId.set(session.id);
    this.mensajes.set([]);
    try {
      const messages = await this.historyService.getChatMessages(session.id);
      if (messages.length > 0) {
        this.mensajes.set(messages.map((m) => ({
          text: m.content,
          isUser: m.role === 'user',
          html: m.role === 'assistant' ? this.toSafeHtml(m.content) : undefined,
        })));
        this.scrollToBottom();
      }
    } catch { /* no-op */ }
  }

  startNewSession(): void {
    this.sessionMenuOpen.set(false);
    this.sessionId.set(null);
    this.mensajes.set([]);
  }

  formatSessionDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.summaryMenuOpen()) { this.summaryMenuOpen.set(false); return; }
    if (this.summaryModalVisible()) { this.closeSummaryModal(); return; }
    if (this.sessionMenuOpen()) { this.sessionMenuOpen.set(false); }
  }

  onSessionDropdownKeydown(event: KeyboardEvent): void {
    const items = Array.from(
      this.elRef.nativeElement.querySelectorAll('.session-item'),
    ) as HTMLElement[];
    if (!items.length) return;
    const idx = items.indexOf(document.activeElement as HTMLElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(idx + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        items[(idx - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
    }
  }

  // ---- Envío de mensajes ----

  async enviarMensaje(event: Event): Promise<void> {
    event.preventDefault();
    if (this.chatLoading()) return;

    const form = event.target as HTMLFormElement;
    const textoInput = (new FormData(form).get('textoChat') as string)?.trim();
    if (!textoInput) return;

    form.reset();

    this.mensajes.update((msgs) => [...msgs, { text: textoInput, isUser: true }]);

    const sessionId = await this.ensureSession().catch(() => null);
    if (sessionId) {
      this.historyService.saveChatMessage(sessionId, 'user', textoInput).catch(() => null);
    }

    this.chatLoading.set(true);
    this.mensajes.update((msgs) => [...msgs, { text: '', isUser: false, loading: true }]);
    this.scrollToBottom();

    try {
      const apiMessages: ChatMessage[] = this.mensajes()
        .filter((m) => !m.loading)
        .map((m) => ({ role: m.isUser ? 'user' : 'assistant', content: m.text }));

      const response = await this.aiService.chat(this.disposition()!.identificador, apiMessages);

      this.mensajes.update((msgs) => {
        const without = msgs.filter((m) => !m.loading);
        return [...without, { text: response, isUser: false, html: this.toSafeHtml(response) }];
      });

      if (sessionId) {
        this.historyService.saveChatMessage(sessionId, 'assistant', response).catch(() => null);
      }
    } catch (error: any) {
      this.mensajes.update((msgs) => msgs.filter((m) => !m.loading));
      this.systemMessageService.showMessage(
        error?.message || 'Error al contactar con la IA',
        true,
      );
    } finally {
      this.chatLoading.set(false);
      this.scrollToBottom();
    }
  }

  // ---- Guardar disposición ----

  async guardarDisposicion(): Promise<void> {
    const disp = this.disposition();
    if (!disp || this.isSaved()) return;

    try {
      await this.historyService.saveDisposition({
        boe_id: disp.identificador,
        titulo: disp.titulo,
        fecha: this.date() ?? '',
        url_pdf: disp.url_pdf.texto,
        url_html: disp.url_html,
      });
      this.isSaved.set(true);
      this.systemMessageService.showMessage('Disposición guardada correctamente', false);
    } catch (error: any) {
      this.systemMessageService.showMessage(error?.message || 'Error al guardar', true);
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 0);
  }
}
