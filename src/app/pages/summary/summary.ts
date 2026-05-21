import { Component, signal } from '@angular/core';
import { inject } from '@angular/core';
import { BoeService } from '../../core/services/boe-service';
import { ActivatedRoute } from '@angular/router';
import { BoeSumario } from '../../core/models/BoeData';
@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary {
  private service = inject(BoeService);
  route = inject(ActivatedRoute);

  sumario = signal<BoeSumario | null>(null);

  ngOnInit() {
    const fecha = this.route.snapshot.paramMap.get('fecha');
    // console.log(fecha);
    this.service.getDailySummary(fecha).subscribe((response) => {
      console.log(response.body);
      this.sumario.set(response.body?.data.sumario || null);
    });
  }

  ensureArray(value: any): any[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }
}
