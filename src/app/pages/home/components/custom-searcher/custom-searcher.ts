import { Component, signal } from '@angular/core';
import { FormField, form, min, max, required } from '@angular/forms/signals';
@Component({
  selector: 'app-custom-searcher',
  imports: [FormField],
  templateUrl: './custom-searcher.html',
  styleUrl: './custom-searcher.css',
})
export class CustomSearcher {
  data = signal({
    day: '',
    month: '',
    year: '',
  });
  formulario = form(this.data, (schemaPath) => {
    required(schemaPath.day, {
      message: 'Debes introducir un día para realizar la búsqueda.',
    });
    min(schemaPath.day, 1, {
      message: 'El día debe ser un número entre 1 y 31.',
    });
    max(schemaPath.day, 31, {
      message: 'El día debe ser un número entre 1 y 31.',
    });
    required(schemaPath.month, {
      message: 'Debes introducir un mes para realizar la búsqueda.',
    });
    min(schemaPath.month, 1, {
      message: 'El mes debe ser un número entre 1 y 12.',
    });
    max(schemaPath.month, 12, {
      message: 'El mes debe ser un número entre 1 y 12.',
    });
    required(schemaPath.year, {
      message: 'Debes introducir un año para realizar la búsqueda.',
    });
    min(schemaPath.year, 1900, {
      message: 'El año debe ser un número entre 1900 y ' + new Date().getFullYear() + '.',
    });
    max(schemaPath.year, new Date().getFullYear(), {
      message: 'El año debe ser un número entre 1900 y ' + new Date().getFullYear() + '.',
    });
  });
}
