import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BoeService } from '../../core/services/boe-service';
import { dateToYYYYMMDD } from '../../shared/utils/date-to-yyyymmdd';
import { CustomSearcher } from './components/custom-searcher/custom-searcher';
import { form, FormField, required } from '@angular/forms/signals';
@Component({
  selector: 'app-home',
  imports: [FormField],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private boeService = inject(BoeService);
  private router = inject(Router);

  ngOnInit() {
    this.getTodaysBoe();
  }

  getTodaysBoe() {
    this.boeService.getDailySummary(dateToYYYYMMDD(new Date())).subscribe({
      next: (response) => {
        //console.log('BOE data for today:', response.body);
      },
      error: (error) => {
        console.error('Error fetching BOE data:', error);
      },
    });
  }

  formModel = signal({
    date: '',
  });

  dateSelectForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.date, {
      message: 'Debes introducir una fecha para realizar la búsqueda.',
    });
  });

  async onDateSubmit() {
    const fechaString = this.dateSelectForm().value().date;

    if (!fechaString) return;
    console.log('Fecha seleccionada:', fechaString);

    // Transformamos "2026-05-27" en "20260527" para el BOE quitando los guiones
    const fechaboe = fechaString.replace(/-/g, '');

    this.router.navigate(['sumario', fechaboe]);
  }
}
