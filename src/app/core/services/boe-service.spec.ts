import { TestBed } from '@angular/core/testing';

import { BoeService } from './boe-service';

describe('BoeService', () => {
  let service: BoeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
