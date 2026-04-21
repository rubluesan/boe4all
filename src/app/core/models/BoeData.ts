export interface BoeSumario {
  metadatos: {
    publicacion: string;
    fecha_publicacion: string;
  };
  diario: Diario[];
}

export interface Diario {
  numero: string;
  sumario_diario: SumarioDiario;
  seccion: Seccion[];
}

export interface SumarioDiario {
  identificador: string;
  url_pdf: {
    szBytes: number;
    szKBytes: number;
    texto: string;
  };
}

export interface Seccion {
  codigo: string;
  nombre: string;
  departamento: Departamento[];
}

export interface Departamento {
  codigo: string;
  nombre: string;
  epigrafe: Epigrafe[];
}

export interface Epigrafe {
  nombre: string;
  item: BoeItem[];
}

export interface BoeItem {
  identificador: string;
  control: string;
  titulo: string;
  url_pdf: {
    szBytes: number;
    szKBytes: number;
    pagina_inicial: string;
    pagina_final: string;
    texto: string;
  };
  url_html: string;
  url_xml: string;
}
