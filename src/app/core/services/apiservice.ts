import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { BoeSumario } from '../models/BoeData';
import { Diario } from '../models/BoeData';
import { SumarioDiario } from '../models/BoeData';
import { Seccion } from '../models/BoeData';
import { Departamento } from '../models/BoeData';
import { Epigrafe } from '../models/BoeData';
import { BoeItem } from '../models/BoeData';
@Injectable({
  providedIn: 'root',
})
export class Apiservice {
  private apiUrl = environment.boeapiUrl;
  
}
