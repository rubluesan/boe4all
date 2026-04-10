import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';
import { SystemMessageService } from '../services/system-message-service';

export const guardedRoutesGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);
  const messageService = inject(SystemMessageService);

  const isAuthenticated = await supabase.authReady();

  if (isAuthenticated) {
    return true;
  } else {
    messageService.showMessage('Debes iniciar sesión para acceder a la aplicación', true);
    return router.createUrlTree(['/login']);
  }
};
