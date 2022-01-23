import { TestBed } from '@angular/core/testing';

import { EncrptDecryptService } from './encrpt-decrypt.service';

describe('EncrptDecryptService', () => {
  let service: EncrptDecryptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncrptDecryptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
