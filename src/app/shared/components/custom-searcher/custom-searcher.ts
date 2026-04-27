import { Component } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { signal } from '@angular/core';
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
    Number(schemaPath.day);
    Number(schemaPath.month);
    Number(schemaPath.year);
  });
}
