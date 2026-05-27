import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'yyyymmddToSpanishDate',
})
export class YyyymmddToSpanishDatePipe implements PipeTransform {
  transform(value: string | number): string {
    if (!value) return '';

    // Convertir a string por si te llega como número
    const fechaTexto = value.toString();

    // Validar que al menos tenga la longitud correcta (YYYYMMDD)
    if (fechaTexto.length !== 8) return fechaTexto;

    // Extraer año, mes y día
    const anyo = Number(fechaTexto.substring(0, 4));
    const mes = Number(fechaTexto.substring(4, 6)) - 1;
    const dia = Number(fechaTexto.substring(6, 8));

    const fechaObjeto = new Date(anyo, mes, dia);

    // Configurar las opciones de formato
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    // Retornar el texto formateado en español
    return new Intl.DateTimeFormat('es-ES', opciones).format(fechaObjeto);
  }
}
