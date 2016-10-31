import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable()
export class RpdSelectService {
  private _isVisible: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _isDisabled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _options: any[] = [];
  isVisible: Observable<boolean>;
  isDisabled: Observable<boolean>;
  focusedOption: Subject<any> = new Subject();
  value: Subject<any> = new Subject();

  constructor() {
    this.isVisible = this._isVisible.scan(this._toggle);
    this.isDisabled = this._isDisabled.scan(this._toggle);
  }

  register(option, element) {
    this._options.push(option);
  }

  deregister(toRemove: any) {
    this._options = this._options.filter(option => option !== toRemove);
  }

  updateValue(value: any) {
    console.log('Updating Value', value);
    this.value.next(value);
  }

  toggleVisibility(isVisible?: boolean) {
    this._isVisible.next(isVisible);
  }

  toggleDisability(isDisabled?: boolean) {
    this._isDisabled.next(isDisabled);
  }

  focus(option: any) {
    this.focusedOption.next(option);
  }

  private _toggle(currentState, toggleOverride) {
    return typeof toggleOverride === 'boolean' ? toggleOverride : !currentState;
  }
}
