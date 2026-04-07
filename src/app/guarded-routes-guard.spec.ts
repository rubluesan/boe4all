import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { guardedRoutesGuard } from './guarded-routes-guard';

describe('guardedRoutesGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => guardedRoutesGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
