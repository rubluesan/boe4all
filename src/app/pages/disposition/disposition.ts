import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BoeItem } from '../../core/models/BoeData';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-disposition',
  imports: [],
  templateUrl: './disposition.html',
  styleUrl: './disposition.css',
})
export class Disposition {
  // private service = inject(BoeService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  disposition = signal<BoeItem | null>(null);
  date = signal<string | null>(null);
  mensajes = signal<{ text: string; isUser: boolean }[]>([]);

  safePdfUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.disposition()?.url_pdf.texto;
    if (!url) return null;

    // Pasamos la URL del BOE a través del visor embebido de Google Docs
    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(googleViewerUrl);
  });

  constructor() {
    // esta forma de pasar la data es muy xd, por el momento queda así,
    // se puede crear un servicio global o algo así
    const currentNavigation = this.router.currentNavigation();

    if (currentNavigation?.extras.state) {
      this.disposition.set(currentNavigation.extras.state['disposition'] as BoeItem);
      this.date.set(currentNavigation.extras.state['date'] as string);
    }
  }
  // Evento para enviar un mensaje en el chat simulado
  enviarMensaje(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const textoInput = formData.get('textoChat') as string;

    if (!textoInput || !textoInput.trim()) {
      return;
    }

    this.mensajes.update((msgs) => [...msgs, { text: textoInput.trim(), isUser: true }]);

    form.reset();

    setTimeout(() => {
      const container = document.querySelector('.chat-messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  }
}
