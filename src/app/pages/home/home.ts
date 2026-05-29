import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BoeService } from '../../core/services/boe-service';
import { dateToString } from '../../shared/utils/fechas-boe';
@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private boeService = inject(BoeService);
  private router = inject(Router);
  todaysDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD para el input date

  ngOnInit() {
    this.getTodaysBoe();
  }

  getTodaysBoe() {
    this.boeService.getDailySummary(dateToString(new Date())).subscribe({
      next: (response) => {
        //console.log('BOE data for today:', response.body);
      },
      error: (error) => {
        console.error('Error fetching BOE data:', error);
      },
    });
  }

  async onDateSubmit(fechaString: string) {
    if (!fechaString) return;

    // Transformamos "2026-05-27" en "20260527" para el BOE quitando los guiones
    const fechaboe = fechaString.replace(/-/g, '');

    this.router.navigate(['sumario', fechaboe]);
  }
}
