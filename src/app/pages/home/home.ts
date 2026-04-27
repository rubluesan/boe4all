import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BoeService } from '../../core/services/boe-service';
import { dateToYYYYMMDD } from '../../shared/utils/date-to-yyyymmdd';
import { CustomSearcher } from './components/custom-searcher/custom-searcher';
@Component({
  selector: 'app-home',
  imports: [RouterLink, CustomSearcher],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private boeService = inject(BoeService);

  ngOnInit() {
    this.getTodaysBoe();
  }

  getTodaysBoe() {
    this.boeService.getDailySummary(dateToYYYYMMDD(new Date())).subscribe({
      next: (response) => {
        console.log('BOE data for today:', response.body);
      },
      error: (error) => {
        console.error('Error fetching BOE data:', error);
      },
    });
  }
}
