/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RpdSelectService } from './rpd-select.service';

describe('Service: RpdSelect', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RpdSelectService]
    });
  });

  it('should ...', inject([RpdSelectService], (service: RpdSelectService) => {
    expect(service).toBeTruthy();
  }));
});
