import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { BoeDataResponse, BoeSumario } from '../models/BoeData';
import {
  dateToString,
  obtenerDiaAnterior,
  obtenerDiaSiguiente,
  stringToDate,
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

  /**
   * Buscar hacia atrás (BOE Anterior) sin romper la consola por CORS/404.
   * @param fechaActual Fecha desde la que navegamos (YYYYMMDD)
   * @param primerNumeroDiarioLeido El PRIMER número de BOE del día actual (si hay varios, el menor)
   */
  buscarBoeAnterior(
    fechaActual: string,
    primerNumeroDiarioLeido: number,
  ): Observable<BoeDataResponse> {
    let fechaClave = obtenerDiaAnterior(fechaActual);
    const fechaClaveDate = stringToDate(fechaClave);

    // Si el día anterior es domingo, nos lo saltamos preventivamente
    if (fechaClaveDate.getDay() === 0) {
      fechaClave = obtenerDiaAnterior(fechaClave);
    }

    // Control de límite histórico
    if (parseInt(fechaClave, 10) < parseInt(this.FECHA_MINIMA, 10)) {
      return throwError(() => new Error('Has llegado al primer BOE de la historia.'));
    }

    return this.http.get<BoeDataResponse>(`${this.apiUrl}/${fechaClave}`).pipe(
      switchMap((resSabado) => {
        const ultimoNumeroSabado = resSabado.data.sumario.diario[0].numero;
        // Si el lunes empezamos por el diario 120 y el sábado el último fue el 118...
        // Significa que el diario 119 se publicó el DOMINGO.
        if (primerNumeroDiarioLeido - ultimoNumeroSabado > 1) {
          const fechaDomingo = obtenerDiaSiguiente(fechaClave);
          return this.http.get<BoeDataResponse>(`${this.apiUrl}/${fechaDomingo}`);
        }

        return of(resSabado);
      }),
      catchError((error) => {
        return this.buscarBoeAnterior(fechaClave, primerNumeroDiarioLeido);
      }),
    );
  }

  // Buscar hacia adelante (BOE Siguiente)
  buscarBoeSiguiente(
    fechaActual: string,
    ultimoNumeroDiarioLeido: number,
  ): Observable<BoeDataResponse> {
    let fechaClave = obtenerDiaSiguiente(fechaActual);
    const fechaClaveDate = stringToDate(fechaClave);
    const hoyStr = dateToString(new Date());

    if (parseInt(fechaClave, 10) > parseInt(hoyStr, 10)) {
      return throwError(() => new Error('No hay publicaciones futuras disponibles.'));
    }

    // Si el día siguiente es domingo, nos lo saltamos preventivamente
    if (fechaClaveDate.getDay() === 0) {
      fechaClave = obtenerDiaSiguiente(fechaClave);
    }

    return this.http.get<BoeDataResponse>(`${this.apiUrl}/${fechaClave}`).pipe(
      switchMap((resLunes) => {
        const primerNumeroLunes =
          resLunes.data.sumario.diario[resLunes.data.sumario.diario.length - 1].numero;

        if (primerNumeroLunes - ultimoNumeroDiarioLeido > 1) {
          const fechaDomingo = obtenerDiaAnterior(fechaClave);
          return this.http.get<BoeDataResponse>(`${this.apiUrl}/${fechaDomingo}`);
        }

        return of(resLunes);
      }),
      catchError((error) => {
        return this.buscarBoeSiguiente(fechaClave, ultimoNumeroDiarioLeido);
      }),
    );
  }
}
