import { Component, signal, computed, inject, effect } from '@angular/core';
import { BoeService } from '../../core/services/boe-service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BoeItem, BoeSumario } from '../../core/models/BoeData';
import { YyyymmddToSpanishDatePipe } from '../../core/pipes/yyyymmdd-to-spanish-date-pipe';
import { LucideAngularModule } from 'lucide-angular';
import { dateToString } from '../../shared/utils/fechas-boe';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { SeoService } from '../../core/services/seo-service';
@Component({
  selector: 'app-summary',
  imports: [YyyymmddToSpanishDatePipe, RouterOutlet, LucideAngularModule, TooltipDirective],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary {
  private boeService = inject(BoeService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  sumario = signal<BoeSumario | null>({} as BoeSumario);
  fechaBoeActual = signal<string | null>(null);
  fechaUrl = signal<string | null>(null);
  fechaHoy = signal<string>(dateToString(new Date())); // fecha de hoy en formato YYYYMMDD

  loading = signal(false);
  showLoader = signal(false);
  private loadingTimeout?: number;
  notFound = signal(false);

  constructor() {
    const seo = inject(SeoService);
    seo.setPage({ title: 'BOE', noIndex: true });
    effect(() => {
      const fecha = this.fechaBoeActual();
      if (fecha) seo.setPage({ title: `BOE ${fecha}`, noIndex: true });
    });
    effect(() => {
      if (this.loading()) {
        this.loadingTimeout = window.setTimeout(() => {
          if (this.loading()) {
            this.showLoader.set(true);
          }
        }, 180);
      } else {
        clearTimeout(this.loadingTimeout);
        this.showLoader.set(false);
      }
    });
  }
  //Función que se ejecutará al cargar el componente para obtener el sumario del BOE de la fecha indicada en la URL y manejar los estados de carga y error
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const fecha = params.get('fecha');
      this.fechaUrl.set(fecha);

      this.loading.set(true);

      this.boeService.getDailySummary(fecha).subscribe({
        next: (response) => {
          this.sumario.set(response.body?.data.sumario || null);
          this.loading.set(false);
          this.fechaBoeActual.set(response.body?.data.sumario.metadatos.fecha_publicacion || null);
          this.notFound.set(false);
        },
        error: (_error) => {
          this.loading.set(false);
          this.notFound.set(true);
        },
      });
    });
  }

  ensureArray(value: any): any[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  openDisposition(boeItem: BoeItem) {
    this.router.navigate(['sumario', this.fechaBoeActual(), 'disposicion', boeItem.identificador], {
      state: { disposition: boeItem, date: this.sumario()?.metadatos.fecha_publicacion },
    });
  }
  //Función que navega al BOE del dia anterior al seleccionado
  irAlAnterior() {
    this.boeService
      .buscarBoeAnterior(
        this.fechaBoeActual()!,
        this.sumario()!.diario[this.sumario()!.diario.length - 1]!.numero,
      )
      .subscribe({
        next: (response) => {
          const nuevaFecha = response.data.sumario.metadatos.fecha_publicacion;
          this.router.navigate(['/sumario', nuevaFecha]);
        },
        // error: (err) => console.warn(err.message), // Ej: "Has llegado al primer BOE..."
      });
  }
  //Función que navega al BOE del dia siguiente al seleccionado
  irAlSiguiente() {
    this.boeService
      .buscarBoeSiguiente(this.fechaBoeActual()!, this.sumario()!.diario[0]!.numero)
      .subscribe({
        next: (response) => {
          const nuevaFecha = response.data.sumario.metadatos.fecha_publicacion;
          this.router.navigate(['/sumario', nuevaFecha]);
        },
        // error: (err) => console.warn(err.message), // Ej: "No hay publicaciones futuras..."
      });
  }

  // ---- Filtros ----
  filtroTexto = signal<string>('');
  filtroSeccion = signal<string>('todas');

  seccionesUnicas = computed<string[]>(() => {
    const sumario = this.sumario();
    if (!sumario?.diario?.length) return [];
    const names: string[] = [];
    for (const diario of sumario.diario) {
      for (const sec of this.ensureArray(diario.seccion)) {
        if (sec.nombre && !names.includes(sec.nombre)) names.push(sec.nombre);
      }
    }
    return names;
  });

  hayFiltrosActivos = computed(
    () => this.filtroTexto().trim().length > 0 || this.filtroSeccion() !== 'todas',
  );

  totalItemsFiltrados = computed(() => {
    const sumario = this.sumario();
    if (!sumario?.diario?.length) return -1;
    let count = 0;
    for (const diario of sumario.diario) {
      for (const sec of this.ensureArray(diario.seccion)) {
        if (!this.seccionVisible(sec.nombre)) continue;
        for (const dep of this.getDepartamentos(sec)) {
          for (const ic of this.getItemsConContexto(dep)) {
            if (this.matchesFilter(ic.item)) count++;
          }
        }
      }
    }
    return count;
  });

  getDepartamentos(seccion: any): any[] {
    return [
      ...this.ensureArray(seccion.texto?.departamento),
      ...this.ensureArray(seccion.departamento),
    ];
  }

  getItemsConContexto(departamento: any): { item: BoeItem; epigrafe?: string }[] {
    const result: { item: BoeItem; epigrafe?: string }[] = [];
    if (departamento.item) {
      for (const item of this.ensureArray(departamento.item)) result.push({ item });
    } else {
      const texto = departamento.texto;
      if (texto) {
        if (texto.item) {
          for (const item of this.ensureArray(texto.item)) result.push({ item });
        } else {
          for (const ep of this.ensureArray(texto.epigrafe)) {
            for (const item of this.ensureArray(ep.item))
              result.push({ item, epigrafe: ep.nombre });
          }
        }
      } else {
        for (const ep of this.ensureArray(departamento.epigrafe)) {
          for (const item of this.ensureArray(ep.item)) result.push({ item, epigrafe: ep.nombre });
        }
      }
    }
    return result;
  }

  matchesFilter(item: BoeItem): boolean {
    const texto = this.filtroTexto().trim().toLowerCase();
    if (!texto) return true;
    return item.titulo?.toLowerCase().includes(texto) ?? false;
  }

  seccionVisible(nombreSeccion: string): boolean {
    return this.filtroSeccion() === 'todas' || this.filtroSeccion() === nombreSeccion;
  }

  abreviarSeccion(nombre: string): string {
    const match = nombre.match(/[IVXivx]+\./);
    return match ? `Sec. ${match[0].replace('.', '')}` : nombre.slice(0, 10);
  }

  departamentoTieneItems(departamento: any): boolean {
    return this.getItemsConContexto(departamento).some(ic => this.matchesFilter(ic.item));
  }

  seccionTieneItems(seccion: any): boolean {
    return this.getDepartamentos(seccion).some(dep => this.departamentoTieneItems(dep));
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroSeccion.set('todas');
  }
}
