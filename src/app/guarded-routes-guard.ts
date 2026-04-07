import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './core/services/supabase-service';

export const guardedRoutesGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
