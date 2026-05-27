// breadcrumb.component.ts
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumbs.html',
  styleUrls: ['./breadcrumbs.css'],
  imports: [RouterLink, CommonModule],
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

    // Buscamos la ruta que está actualmente activa en este nivel
    const child = children.find((c) => c.snapshot.url.length > 0 || c.routeConfig?.path === '');

    if (child) {
      const routeURL: string = child.snapshot.url.map((segment) => segment.path).join('/');

      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];

      // Evitamos duplicar si el padre y el hijo comparten el mismo texto
      if (label && (!breadcrumbs.length || breadcrumbs[breadcrumbs.length - 1].label !== label)) {
        breadcrumbs.push({ label, url });
      }

      return this.crearBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
