import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

const SITE_NAME = 'BOE4ALL';
const DEFAULT_DESCRIPTION =
  'Tu asistente inteligente del Boletín Oficial del Estado. Resúmenes con IA, búsqueda avanzada y chat sobre cualquier disposición oficial.';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private titleService = inject(Title);
  private meta = inject(Meta);

  setPage(config: { title: string; description?: string; noIndex?: boolean }): void {
    this.titleService.setTitle(`${config.title} | ${SITE_NAME}`);
    this.meta.updateTag({ name: 'description', content: config.description ?? DEFAULT_DESCRIPTION });
    this.meta.updateTag({
      name: 'robots',
      content: config.noIndex ? 'noindex, nofollow' : 'index, follow',
    });
  }

  setLanding(): void {
    this.titleService.setTitle(`${SITE_NAME} — Tu asistente del Boletín Oficial del Estado`);
    this.meta.updateTag({ name: 'description', content: DEFAULT_DESCRIPTION });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: `${SITE_NAME} — BOE con inteligencia artificial` });
    this.meta.updateTag({ property: 'og:description', content: DEFAULT_DESCRIPTION });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: `${SITE_NAME} — BOE con IA` });
    this.meta.updateTag({ name: 'twitter:description', content: DEFAULT_DESCRIPTION });
  }
}
