import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SeoService } from '../../core/services/seo-service';
import { LucideAngularModule } from 'lucide-angular';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { ConfirmDeleteModal } from '../../shared/components/confirm-delete-modal/confirm-delete-modal';
import { marked } from 'marked';
import {
  HistoryService,
  SavedDisposition,
  SavedSummary,
  ChatSession,
} from '../../core/services/history-service';
import { SystemMessageService } from '../../core/services/system-message-service';
import { YyyymmddToSpanishDatePipe } from '../../core/pipes/yyyymmdd-to-spanish-date-pipe';
import { BoeItem } from '../../core/models/BoeData';

type Tab = 'dispositions' | 'summaries' | 'chats';
type DeleteType = 'disposition' | 'chat' | 'summary';

@Component({
  selector: 'app-my-boe',
  imports: [LucideAngularModule, RouterLink, YyyymmddToSpanishDatePipe, TooltipDirective, ConfirmDeleteModal],
  templateUrl: './my-boe.html',
  styleUrl: './my-boe.css',
})
export class MyBoe implements OnInit {
  private historyService = inject(HistoryService);
  private systemMessageService = inject(SystemMessageService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);

  activeTab = signal<Tab>('dispositions');
  loading = signal(true);

  savedDispositions = signal<SavedDisposition[]>([]);
  savedSummaries = signal<SavedSummary[]>([]);
  chatSessions = signal<ChatSession[]>([]);

  // Modal de vista de resumen
  summaryViewVisible = signal(false);
  summaryViewItem = signal<SavedSummary | null>(null);
  summaryViewHtml = computed<SafeHtml | null>(() => {
    const s = this.summaryViewItem();
    if (!s) return null;
    const html = marked.parse(s.content, { async: false }) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  });

  // Modal de confirmación de borrado
  deleteModalVisible = signal(false);
  private pendingDeleteId = signal<string>('');
  private pendingDeleteType = signal<DeleteType | ''>('');

  deleteModalTitle = computed(() => {
    switch (this.pendingDeleteType()) {
      case 'disposition': return 'Eliminar disposición guardada';
      case 'chat': return 'Eliminar conversación';
      case 'summary': return 'Eliminar resumen';
      default: return 'Eliminar elemento';
    }
  });

  deleteModalDescription = computed(() => {
    switch (this.pendingDeleteType()) {
      case 'disposition': return '¿Seguro que quieres eliminar esta disposición? No podrás recuperarla.';
      case 'chat': return '¿Seguro que quieres eliminar esta conversación? No podrás recuperarla.';
      case 'summary': return '¿Seguro que quieres eliminar este resumen? No podrás recuperarlo.';
      default: return 'Esta acción no se puede deshacer.';
    }
  });

  constructor() { inject(SeoService).setPage({ title: 'Mi BOE', noIndex: true }); }

  ngOnInit() {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.loading.set(true);
    try {
      const [dispositions, summaries, sessions] = await Promise.all([
        this.historyService.getSavedDispositions(),
        this.historyService.getSavedSummaries(),
        this.historyService.getChatSessions(),
      ]);
      this.savedDispositions.set(dispositions);
      this.savedSummaries.set(summaries);
      this.chatSessions.set(sessions);
    } catch (error: any) {
      this.systemMessageService.showMessage('Error al cargar los datos', true);
    } finally {
      this.loading.set(false);
    }
  }

  openSummaryView(item: SavedSummary): void {
    this.summaryViewItem.set(item);
    this.summaryViewVisible.set(true);
  }

  closeSummaryView(): void {
    this.summaryViewVisible.set(false);
  }

  async copySummaryContent(): Promise<void> {
    const content = this.summaryViewItem()?.content;
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      this.systemMessageService.showMessage('Copiado al portapapeles', false);
    } catch {
      this.systemMessageService.showMessage('No se pudo copiar', true);
    }
  }

  getDispositionForSummary(boeId?: string): SavedDisposition | null {
    if (!boeId) return null;
    return this.savedDispositions().find((d) => d.boe_id === boeId) ?? null;
  }

  openDispositionFromSummary(): void {
    const summary = this.summaryViewItem();
    if (!summary) return;
    const disp = this.getDispositionForSummary(summary.boe_id);
    if (disp) this.openDisposition(disp);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.summaryViewVisible()) { this.closeSummaryView(); return; }
    if (this.deleteModalVisible()) { this.closeDeleteModal(); }
  }

  openDeleteConfirm(type: DeleteType, id: string): void {
    this.pendingDeleteType.set(type);
    this.pendingDeleteId.set(id);
    this.deleteModalVisible.set(true);
  }

  async confirmDelete(): Promise<void> {
    const type = this.pendingDeleteType();
    const id = this.pendingDeleteId();
    if (!id) return;

    if (type === 'disposition') {
      await this.deleteDisposition(id);
    } else if (type === 'chat') {
      await this.deleteChat(id);
    } else if (type === 'summary') {
      await this.deleteSummary(id);
    }
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.deleteModalVisible.set(false);
    this.pendingDeleteId.set('');
    this.pendingDeleteType.set('');
  }

  private async deleteDisposition(boeId: string): Promise<void> {
    try {
      await this.historyService.deleteSavedDisposition(boeId);
      this.savedDispositions.update((items) => items.filter((i) => i.boe_id !== boeId));
      this.systemMessageService.showMessage('Disposición eliminada', false);
    } catch {
      this.systemMessageService.showMessage('Error al eliminar la disposición', true);
    }
  }

  openDisposition(item: SavedDisposition): void {
    const fakeItem: BoeItem = {
      identificador: item.boe_id,
      titulo: item.titulo,
      control: '',
      url_pdf: { szBytes: 0, szKBytes: 0, pagina_inicial: 0, pagina_final: 0, texto: item.url_pdf },
      url_html: item.url_html,
      url_xml: '',
    };
    this.router.navigate(['/sumario', item.fecha, 'disposicion', item.boe_id], {
      state: { disposition: fakeItem, date: item.fecha, noSession: true },
    });
  }

  private async deleteSummary(id: string): Promise<void> {
    try {
      await this.historyService.deleteSummaryById(id);
      this.savedSummaries.update((items) => items.filter((s) => s.id !== id));
      this.systemMessageService.showMessage('Resumen eliminado', false);
    } catch {
      this.systemMessageService.showMessage('Error al eliminar el resumen', true);
    }
  }

  private async deleteChat(sessionId: string): Promise<void> {
    try {
      await this.historyService.deleteChatSession(sessionId);
      this.chatSessions.update((items) => items.filter((s) => s.id !== sessionId));
      this.systemMessageService.showMessage('Conversación eliminada', false);
    } catch {
      this.systemMessageService.showMessage('Error al eliminar la conversación', true);
    }
  }

  openChat(session: ChatSession): void {
    const fecha = this.extractFechaFromPdfUrl(session.url_pdf);
    const fakeItem: BoeItem = {
      identificador: session.boe_id,
      titulo: session.titulo,
      control: '',
      url_pdf: { szBytes: 0, szKBytes: 0, pagina_inicial: 0, pagina_final: 0, texto: session.url_pdf },
      url_html: session.url_html,
      url_xml: '',
    };
    this.router.navigate(['/sumario', fecha, 'disposicion', session.boe_id], {
      state: { disposition: fakeItem, date: fecha, sessionId: session.id },
    });
  }

  private extractFechaFromPdfUrl(urlPdf: string): string {
    const match = urlPdf.match(/\/boe\/dias\/(\d{4})\/(\d{2})\/(\d{2})\//);
    return match ? `${match[1]}${match[2]}${match[3]}` : '_';
  }

  formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  truncate(text: string, max = 180): string {
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  stripMarkdown(text: string): string {
    return text
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/[-*+]\s+/g, '')
      .replace(/\d+\.\s+/g, '')
      .replace(/\n+/g, ' ')
      .trim();
  }
}
