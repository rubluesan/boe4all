import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';

export const guardedRoutesGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);

  const isAuthenticated = await supabase.authReady();

  if (isAuthenticated) {
    return true;
  } else {
    return router.createUrlTree(['/login']);
  }
};
