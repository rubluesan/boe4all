// breadcrumb.component.ts
import { Component } from '@angular/core';
import { BreadcrumbService } from '../../../core/services/breadcrumbs';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent {
  constructor(public breadcrumbService: BreadcrumbService) {}
}
