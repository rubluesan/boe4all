// Convierte "20260528" en un objeto Date real
export function stringToDate(yyyymmdd: string): Date {
  const año = parseInt(yyyymmdd.substring(0, 4), 10);
  const mes = parseInt(yyyymmdd.substring(4, 6), 10) - 1; // Los meses en JavaScript van de 0 a 11
  const dia = parseInt(yyyymmdd.substring(6, 8), 10);
  return new Date(año, mes, dia);
}

// Convierte un objeto Date en "20260528"
export function dateToString(date: Date): string {
  const año = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${año}${mes}${dia}`;
}

// Obtener el día anterior en formato YYYYMMDD
export function obtenerDiaAnterior(yyyymmdd: string): string {
  const date = stringToDate(yyyymmdd);
  date.setDate(date.getDate() - 1);
  return dateToString(date);
}

// Obtener el día siguiente en formato YYYYMMDD
export function obtenerDiaSiguiente(yyyymmdd: string): string {
  const date = stringToDate(yyyymmdd);
  date.setDate(date.getDate() + 1);
  return dateToString(date);
}
