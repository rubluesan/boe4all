import { Component, signal } from '@angular/core';
import { inject, effect } from '@angular/core';
import { BoeService } from '../../core/services/boe-service';
import { ActivatedRoute, Router, RouterOutlet, RouterLink } from '@angular/router';
import { BoeItem, BoeSumario } from '../../core/models/BoeData';
import { YyyymmddToSpanishDatePipe } from '../../core/pipes/yyyymmdd-to-spanish-date-pipe';
import { LucideAngularModule } from 'lucide-angular';
import { dateToString } from '../../shared/utils/fechas-boe';
@Component({
  selector: 'app-summary',
  imports: [YyyymmddToSpanishDatePipe, RouterOutlet, LucideAngularModule],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary {
  private boeService = inject(BoeService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  sumario = signal<BoeSumario | null>({} as BoeSumario);
  fechaBoeActual = signal<string | null>(null);
  fechaHoy = signal<string>(dateToString(new Date())); // fecha de hoy en formato YYYYMMDD

  loading = signal(false);
  showLoader = signal(false);
  private loadingTimeout?: number;
  notFound = signal(false);

  constructor() {
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

      this.loading.set(true);

      this.boeService.getDailySummary(fecha).subscribe({
        next: (response) => {
          this.sumario.set(response.body?.data.sumario || null);
          this.loading.set(false);
          this.fechaBoeActual.set(response.body?.data.sumario.metadatos.fecha_publicacion || null);
          this.notFound.set(false);
        },
        error: (error) => {
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
}
