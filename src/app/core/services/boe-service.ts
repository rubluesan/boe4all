import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BoeDataResponse, BoeSumario } from '../models/BoeData';
import { ActivatedRoute } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class BoeService {
  private http = inject(HttpClient);
  private apiUrl = environment.boeapiUrl;
  /*private route = inject(ActivatedRoute);
  ngOnInit() {
  const fecha = this.route.snapshot.paramMap.get('fecha');
  console.log(fecha);
  this.getDailySummary(fecha).subscribe(response => {
    console.log(response.body);
  });
}*/
  public getDailySummary(date: string |null): Observable<HttpResponse<BoeDataResponse>> {
    return this.http.get<BoeDataResponse>(this.apiUrl + `/${date}`, {
      observe: 'response',
    });
  }
}
