/**
 * Este archivo define las interfaces TypeScript que modelan la estructura de
 * los datos obtenidos de la API pública del BOE (Boletín Oficial del Estado).
 * Incluyendo metadatos, diarios, secciones, departamentos, epígrafes e ítems.
 */

// Interfaz principal que representa el sumario del BOE
export interface BoeSumario {
  metadatos: {
    publicacion: string; // == 'BOE'
    fecha_publicacion: string; // Formato ISO 8601 YYYYMMDD
  };
  diario: Diario[];
}

// Interfaz que representa un diario del BOE, incluyendo su número, sumario y secciones
export interface Diario {
  numero: number; // Numero de 1 a 3 digitos
  sumario_diario: SumarioDiario;
  seccion: Seccion[];
}

// Interfaz que representa el sumario diario del BOE, incluyendo su identificador y URL del PDF
export interface SumarioDiario {
  identificador: string;
  url_pdf: {
    szBytes: number; // De 1 a 9 dígitos
    szKBytes: number; // De 1 a 6 dígitos
    texto: string; // url pdf
  };
}

// Interfaz que representa una sección del BOE, incluyendo su código, nombre y departamentos asociados
export interface Seccion {
  codigo: string; // Código alfanumérico de 1 ó 2 caracteres
  nombre: string;
  departamento: Departamento[];
}

// Interfaz que representa un departamento de la administración, incluyendo su código, nombre y epígrafes asociados
export interface Departamento {
  codigo: number; // Código numérico de 4 dígitos
  nombre: string;
  epigrafe: Epigrafe[];
}

// Interfaz que representa un epígrafe (frase que sugiere la temática), incluyendo su nombre y los ítems asociados
export interface Epigrafe {
  nombre: string;
  item: BoeItem[];
}

// Interfaz que representa un ítem del BOE, incluyendo su identificador, control, título y URLs de los documentos asociados
export interface BoeItem {
  identificador: string;
  control: string;
  titulo: string;
  url_pdf: {
    szBytes: number; // De 1 a 9 dígitos
    szKBytes: number; // De 1 a 6 dígitos
    pagina_inicial: number; // De 1 a 6 dígitos
    pagina_final: number; // De 1 a 6 dígitos
    texto: string; // url pdf
  };
  url_html: string;
  url_xml: string;
}
