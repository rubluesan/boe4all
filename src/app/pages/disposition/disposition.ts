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

  safePdfUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.disposition()?.url_pdf.texto;
    if (!url) return null;

    // Pasamos la URL del BOE a través del visor embebido de Google Docs
    const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

    return this.sanitizer.bypassSecurityTrustResourceUrl(googleViewerUrl);
  });

  constructor() {
    const currentNavigation = this.router.currentNavigation();

    if (currentNavigation?.extras.state) {
      this.disposition.set(currentNavigation.extras.state['disposition'] as BoeItem);
      this.date.set(currentNavigation.extras.state['date'] as string);
    }
  }

  ngOnInit() {
    /* Si el usuario recarga la página (F5), boeItem será null, por lo 
    que lo llevamos de vuelta a la lista para que no vea la pantalla vacía.
    */
    if (!this.disposition()) {
      this.router.navigate(['/sumario', { fecha: this.date() }]);
    }
  }
}
