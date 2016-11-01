import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

const PREV = 'prev';
const NEXT = 'next';

@Injectable()
export class RpdSelectService {
  private _isVisible: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _isDisabled: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _focusedOption: Subject<any> = new Subject();
  private _options: any[] = [];
  isVisible: Observable<boolean>;
  isDisabled: Observable<boolean>;
  focusedOption: Observable<any>;
  value: Subject<any> = new Subject();

  constructor() {
    this.isVisible = this._isVisible.scan(this._toggle);
    this.isDisabled = this._isDisabled.scan(this._toggle);
    this.focusedOption = this._focusedOption.scan((currentFocused, next) => {
      return typeof next === 'string' ?
        this._findNextOption(currentFocused, next) : next;
    });
  }

  register(option) {
    this._options = [...this._options, option];
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

  setFocus(option: any) {
    this._focusedOption.next(option);
  }

  focusOption(direction: string) {
    this._focusedOption.next(direction);
  }

  focusPrevOption() {
    this.focusOption(PREV);
  }

  focusNextOption() {
    this.focusOption(NEXT);
  }

  private _findNextOption(option: any, direction: string) {
    const currentIndex = this._options.indexOf(option);

    if (currentIndex === -1) {
      return this._options[0];
    } else if (direction === PREV && currentIndex > 0) {
      return this._options[currentIndex - 1];
    } else if (direction === NEXT && currentIndex < this._options.length - 1) {
      return this._options[currentIndex + 1];
    }

    return option;
  }

  private _toggle(currentState, toggleOverride) {
    return typeof toggleOverride === 'boolean' ? toggleOverride : !currentState;
  }
}
