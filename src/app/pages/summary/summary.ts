import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { BoeService } from '../../core/services/boe-service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-summary',
  imports: [],
  templateUrl: './summary.html',
  styleUrl: './summary.css',
})
export class Summary {
  private service = inject(BoeService);
  route = inject(ActivatedRoute);
  ngOnInit() {
    const fecha = this.route.snapshot.paramMap.get('fecha');
    // console.log(fecha);
    this.service.getDailySummary(fecha).subscribe((response) => {
      console.log(response.body);
    });
  }
}
