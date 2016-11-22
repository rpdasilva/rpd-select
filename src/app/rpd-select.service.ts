import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  ConnectableObservable,
  Observable,
  Subject
} from 'rxjs';
import {
  FIRST,
  MOST_RECENT,
  PREV,
  NEXT,
  ADD_OPTION,
  REMOVE_OPTION
} from './rpd-select.constants';

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
  value$: BehaviorSubject<any> = new BehaviorSubject(null);
  // value$: Subject<any> = new Subject();

  constructor() {
    this.isDisabled$ = this._isDisabled$.scan(this._toggle);
    this.isMultiple$ = this._isMultiple$.scan(this._toggle);
    this.isVisible$ = this._isVisible$.scan(this._toggle);
    this.options$ = this._options$
      .scan(this._optionsReducer, new Map()).publish();
    this.options$.connect();

    this.focusedOption$ = this._focusedOption$
      .withLatestFrom(this.options$)
      .scan((focused, [next, options]) =>
        this._getFocusedOption(options, focused, next), FIRST)
      .cache(1);

    this.isMultiple$
      .withLatestFrom(this.value$)
      .delay(0)
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
    if (value !== null) {
      console.log('Updating value', {value});
      this.value$.next(value);
    }
  }

  toggleDisability(isDisabled?: boolean) {
    this._isDisabled$.next(isDisabled);
  }

  toggleMultiple(isMultiple) {
    console.log('Toggle multiple', isMultiple);
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
    let newOptions;

    switch (action.type) {
      case ADD_OPTION:
        newOptions = new Map(options);
        return newOptions.set(action.payload.instance, action.payload);

      case REMOVE_OPTION:
        newOptions = new Map(options);
        newOptions.delete(action.payload);
        return newOptions;

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
    const optionKeys = Array.from(options.keys());
    const currentIndex = optionKeys.indexOf(focused);

    if (direction === FIRST || currentIndex === -1) {
      return optionKeys[0];
    } else if (direction === PREV && currentIndex > 0) {
      return optionKeys[currentIndex - 1];
    } else if (direction === NEXT && currentIndex < optionKeys.length - 1) {
      return optionKeys[currentIndex + 1];
    } else {
      return focused;
    }
  }

  private _toggle(currentState, toggleOverride) {
    return typeof toggleOverride === 'boolean' ?
      toggleOverride : !currentState;
  }

  private _changeValueForMultiple(isMultiple, value, value$) {
    console.log('_changeValueForMultiple', {isMultiple, value});
    if (isMultiple && !Array.isArray(value)) {
      value === null ? value$.next([]) : value$.next([value]);
    } else if (!isMultiple && Array.isArray(value)) {
      value$.next(value[0]);
    }
  }
}
