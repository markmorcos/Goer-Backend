import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ConstantService {
  error: Subject<string> = new Subject();

  constructor() { }

  setError(value) {
    this.error.next(value);
  }
}
