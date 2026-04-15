// breadcrumb.component.ts
import { Component } from '@angular/core';
import { BreadcrumbService } from '../../../core/services/breadcrumbs';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumbs.html',
  styleUrls: ['./breadcrumbs.css'],
  imports: [RouterLink, CommonModule],
})
export class BreadcrumbComponent {
  constructor(public breadcrumbService: BreadcrumbService) {}
}
