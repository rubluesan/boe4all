import { Component, signal } from '@angular/core';
import { inject } from '@angular/core';
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

  sumario = signal<BoeSumario | null>(null);
  loading = signal(false);
  fechaBoeActual = signal<string | null>(null);
  fechaHoy = signal<string>(dateToString(new Date())); // fecha de hoy en formato YYYYMMDD

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const fecha = params.get('fecha');

      this.loading.set(true);

      this.boeService.getDailySummary(fecha).subscribe({
        next: (response) => {
          this.sumario.set(response.body?.data.sumario || null);
          this.loading.set(false);
          this.fechaBoeActual.set(response.body?.data.sumario.metadatos.fecha_publicacion || null);
        },
        error: (error) => {
          this.loading.set(false);
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
