// breadcrumb.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumbs.html',
  styleUrls: ['./breadcrumbs.css'],
  imports: [RouterLink],
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    // Escuchar cada vez que la navegación termine con éxito
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.breadcrumbs = this.crearBreadcrumbs(this.activatedRoute.root);
      this.cdr.detectChanges();
    });
  }

  private crearBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = [],
  ): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    const child = children.find((c) => c.snapshot.url.length > 0 || c.routeConfig?.path === '');

    if (child) {
      const routeURL: string = child.snapshot.url.map((segment) => segment.path).join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      // 1. Obtener el texto base de la configuración (ej: 'Disposicion {id}')
      let label = child.snapshot.data['breadcrumb'];

      // 2. MAGIA AQUÍ: Si el texto existe, buscamos los parámetros de la URL
      if (label) {
        const params = child.snapshot.params; // Esto contiene { id: 'BOE-A-2026-123' }

        // Recorremos todos los parámetros activos y reemplazamos sus llaves en el texto
        Object.keys(params).forEach((key) => {
          label = label.replace(`{${key}}`, params[key]);
        });
      }

      if (label && (!breadcrumbs.length || breadcrumbs[breadcrumbs.length - 1].label !== label)) {
        breadcrumbs.push({ label, url });
      }

      return this.crearBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
