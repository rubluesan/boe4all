import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { dateToString } from '../../shared/utils/fechas-boe';
import { SeoService } from '../../core/services/seo-service';

@Component({
  selector: 'app-home',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private router = inject(Router);
  constructor() { inject(SeoService).setPage({ title: 'BOE del día', noIndex: true }); }
  todaysDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD para el input date

  onDateSubmit(fechaString: string) {
    if (!fechaString) return;
    const fechaboe = fechaString.replace(/-/g, '');
    this.router.navigate(['sumario', fechaboe]);
  }

  irAlBoeDehoy() {
    this.router.navigate(['/sumario', dateToString(new Date())]);
  }
}
