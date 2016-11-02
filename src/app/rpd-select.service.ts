import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  ConnectableObservable,
  Observable,
  Subject
} from 'rxjs';

const PREV = 'PREV';
const NEXT = 'NEXT';
const ADD_OPTION = 'ADD_OPTION';
const REMOVE_OPTION = 'REMOVE_OPTION';

@Injectable()
export class RpdSelectService {
  private _isVisible$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _isDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _focusedOption$: Subject<any> = new Subject();
  private _options$: Subject<any> = new Subject();
  isVisible$: Observable<boolean>;
  isDisabled$: Observable<boolean>;
  focusedOption$: Observable<any>;
  options$: ConnectableObservable<any>;
  value$: Subject<any> = new Subject();

  constructor() {
    this.isVisible$ = this._isVisible$.scan(this._toggle);
    this.isDisabled$ = this._isDisabled$.scan(this._toggle);
    this.options$ = this._options$.scan(this._optionsReducer, []).publish();
    this.options$.connect();

    this.focusedOption$ = this._focusedOption$
      .withLatestFrom(this.options$)
      .scan((focused, [next, options]) =>
        this._getFocusedOption(options, focused, next), NEXT)
      .cache(1);
  }

  register(option: any) {
    this._options$.next({ type: ADD_OPTION, payload: option });
  }

  deregister(option: any) {
    this._options$.next({ type: REMOVE_OPTION, payload: option });
  }

  updateValue(value: any) {
    this.value$.next(value);
  }

  toggleVisibility(isVisible?: boolean) {
    this._isVisible$.next(isVisible);
  }

  toggleDisability(isDisabled?: boolean) {
    this._isDisabled$.next(isDisabled);
  }

  setFocus(next: any) {
    this._focusedOption$.next(next);
  }

  focusPrevOption() {
    this.setFocus(PREV);
  }

  focusNextOption() {
    this.setFocus(NEXT);
  }

  private _optionsReducer(options, action) {
    switch (action.type) {
      case ADD_OPTION:
        return [...options, action.payload];
      case REMOVE_OPTION:
        return options.filter(option => option !== action.payload);
      default:
        return options;
    }
  }

  private _getFocusedOption(options, focused, next) {
    return typeof next === 'string' ?
      this._findNextOption(options, focused, next) : next;
  }

  private _findNextOption(options: any[], focused: any, direction: string) {
    const currentIndex = options.indexOf(focused);

    if (currentIndex === -1) {
      return options[0];
    } else if (direction === PREV && currentIndex > 0) {
      return options[currentIndex - 1];
    } else if (direction === NEXT && currentIndex < options.length - 1) {
      return options[currentIndex + 1];
    }

    return focused;
  }

  private _toggle(currentState, toggleOverride) {
    return typeof toggleOverride === 'boolean' ? toggleOverride : !currentState;
  }
}
