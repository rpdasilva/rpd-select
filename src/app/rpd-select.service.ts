import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  ConnectableObservable,
  Observable,
  Subject
} from 'rxjs';
import { OrderedMap as Map } from 'immutable';

const FIRST = 'FIRST';
const MOST_RECENT = 'MOST_RECENT';
const PREV = 'PREV';
const NEXT = 'NEXT';
const ADD_OPTION = 'ADD_OPTION';
const REMOVE_OPTION = 'REMOVE_OPTION';

/**
 * Common Keyboard actions and their associated keycode.
 */
export const KEY_CODES = {
  COMMA: 188,
  SEMICOLON : 186,
  ENTER: 13,
  ESCAPE: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT_ARROW : 37,
  UP_ARROW : 38,
  RIGHT_ARROW : 39,
  DOWN_ARROW : 40,
  TAB : 9,
  BACKSPACE: 8,
  DELETE: 46
};

export interface IRpdOption {
  instance: any;
  label?: string;
}

@Injectable()
export class RpdSelectService {
  private _isDisabled$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _isMultiple$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _isVisible$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private _focusedOption$: Subject<any> = new Subject();
  private _options$: Subject<any> = new Subject();
  isDisabled$: Observable<boolean>;
  isMultiple$: Observable<boolean>;
  isVisible$: Observable<boolean>;
  focusedOption$: Observable<any>;
  options$: ConnectableObservable<Map<any, IRpdOption>>;
  value$: Subject<any> = new Subject();

  constructor() {
    this.isDisabled$ = this._isDisabled$.scan(this._toggle);
    this.isMultiple$ = this._isMultiple$.scan(this._toggle);
    this.isVisible$ = this._isVisible$.scan(this._toggle);
    this.options$ = this._options$.scan(this._optionsReducer, Map())
      .publish();
    this.options$.connect();

    this.focusedOption$ = this._focusedOption$
      .withLatestFrom(this.options$)
      .scan((focused, [next, options]) =>
        this._getFocusedOption(options, focused, next), FIRST)
      .cache(1);

    this.isMultiple$
      .withLatestFrom(this.value$)
      .subscribe(([isMultiple, value]) => {
        this._changeValueForMultiple(isMultiple, value, this.value$);
      });
  }

  register(option: IRpdOption) {
    this._options$.next({ type: ADD_OPTION, payload: option });
  }

  deregister(option: any) {
    this._options$.next({ type: REMOVE_OPTION, payload: option });
  }

  updateValue(value: any) {
    this.value$.next(value);
  }

  toggleDisability(isDisabled?: boolean) {
    this._isDisabled$.next(isDisabled);
  }

  toggleMultiple(isMultiple) {
    this._isMultiple$.next(isMultiple);
  }

  toggleVisibility(isVisible?: boolean) {
    this._isVisible$.next(isVisible);
  }

  setFocus(next: any) {
    this._focusedOption$.next(next);
  }

  focusMostRecentOption() {
    this.setFocus(MOST_RECENT);
  }

  focusPrevOption() {
    this.setFocus(PREV);
  }

  focusNextOption() {
    this.setFocus(NEXT);
  }

  private _optionsReducer(options: Map<any, IRpdOption>, action) {
    switch (action.type) {
      case ADD_OPTION:
        return options.set(action.payload.instance, action.payload);
      case REMOVE_OPTION:
        return options.delete(action.payload);
      default:
        return options;
    }
  }

  private _getFocusedOption(options: Map<any, IRpdOption>, focused, next) {
    return typeof next === 'string' ?
      this._findNextOption(options, focused, next) : next;
  }

  private _findNextOption(options: Map<any, IRpdOption>, focused: any,
    direction: string) {
    const instances = Array.from(options.keys() as any);
    const currentIndex = instances.indexOf(focused);

    if (direction === FIRST || currentIndex === -1) {
      return instances[0];
    } else if (direction === PREV && currentIndex > 0) {
      return instances[currentIndex - 1];
    } else if (direction === NEXT && currentIndex < instances.length - 1) {
      return instances[currentIndex + 1];
    } else {
      return focused;
    }
  }

  private _toggle(currentState, toggleOverride) {
    return typeof toggleOverride === 'boolean' ?
      toggleOverride : !currentState;
  }

  private _changeValueForMultiple(isMultiple, value, value$) {
    if (isMultiple && !Array.isArray(value)) {
      value$.next([value]);
    } else if (!isMultiple && Array.isArray(value)) {
      value$.next(value[0]);
    }
  }
}
