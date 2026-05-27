import { Component, signal } from '@angular/core';
import { inject } from '@angular/core';
import { BoeService } from '../../core/services/boe-service';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { BoeItem, BoeSumario } from '../../core/models/BoeData';
import { YyyymmddToSpanishDatePipe } from '../../core/pipes/yyyymmdd-to-spanish-date-pipe';
import { LucideAngularModule } from 'lucide-angular';
@Component({
  selector: 'app-summary',
  imports: [YyyymmddToSpanishDatePipe, RouterOutlet, LucideAngularModule],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary {
  private service = inject(BoeService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  sumario = signal<BoeSumario | null>(null);
  loading = signal(false);

  ngOnInit() {
    const fecha = this.route.snapshot.paramMap.get('fecha');
    // console.log(fecha);
    this.loading.set(true);
    this.service.getDailySummary(fecha).subscribe((response) => {
      // console.log(response.body);
      this.sumario.set(response.body?.data.sumario || null);
      this.loading.set(false);
    });
  }

  ensureArray(value: any): any[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  openDisposition(boeItem: BoeItem) {
    this.router.navigate(
      ['sumario', this.route.snapshot.paramMap.get('fecha'), 'disposicion', boeItem.identificador],
      {
        state: { disposition: boeItem, date: this.sumario()?.metadatos.fecha_publicacion },
      },
    );
  }
}
