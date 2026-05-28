import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { BoeDataResponse, BoeSumario } from '../models/BoeData';
import {
  dateToString,
  obtenerDiaAnterior,
  obtenerDiaSiguiente,
} from '../../shared/utils/fechas-boe';

@Injectable({
  providedIn: 'root',
})
export class BoeService {
  private http = inject(HttpClient);
  private apiUrl = environment.boeapiUrl;

  private readonly FECHA_MINIMA = '19600901'; // 1 de Septiembre de 1960 - primera publicación del BOE moderno

  public getDailySummary(date: string | null): Observable<HttpResponse<BoeDataResponse>> {
    return this.http.get<BoeDataResponse>(this.apiUrl + `/${date}`, {
      observe: 'response',
    });
  }

  // Buscar hacia atrás (BOE Anterior)
  buscarBoeAnterior(fechaActual: string): Observable<BoeDataResponse> {
    const fechaClave = obtenerDiaAnterior(fechaActual);

    if (parseInt(fechaClave, 10) < parseInt(this.FECHA_MINIMA, 10)) {
      return throwError(() => new Error('Has llegado al primer BOE de la historia.'));
    }

    return this.http.get<BoeDataResponse>(this.apiUrl + `/${fechaClave}`).pipe(
      catchError((error) => {
        return this.buscarBoeAnterior(fechaClave);
      }),
    );
  }

  // Buscar hacia adelante (BOE Siguiente)
  buscarBoeSiguiente(fechaActual: string): Observable<BoeDataResponse> {
    const fechaClave = obtenerDiaSiguiente(fechaActual);
    const hoyStr = dateToString(new Date());

    if (parseInt(fechaClave, 10) > parseInt(hoyStr, 10)) {
      return throwError(() => new Error('No hay publicaciones futuras disponibles.'));
    }

    return this.http.get<BoeDataResponse>(this.apiUrl + `/${fechaClave}`).pipe(
      catchError((error) => {
        return this.buscarBoeSiguiente(fechaClave);
      }),
    );
  }
}
