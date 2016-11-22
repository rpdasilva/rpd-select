import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { RpdSelectService, IRpdOption } from '../rpd-select.service';
import {
  KEY_CODES,
  NUMPAD_LOCATION,
  NUMPAD_OFFSET
} from '../rpd-select.constants';

const SEARCH_DEBOUNCE = 300;

@Component({
  selector: 'rpd-select',
  template: `
    <div>
      <button [disabled]="rpdSelect.isDisabled$ | async"
        (keydown)="selectButtonKeyDown($event)"
        (click)="toggleVisibility($event)" #selectButton
        >{{ (currentLabel$ | async) || placeholder }}
        <svg viewBox="0 0 10 10" style="height: 0.5rem; fill: currentcolor;">
          <polygon points="0 0,10 0,5 10" />
        </svg>
      </button>

      <div *ngIf="rpdSelect.isVisible$ | async">
        <ng-content></ng-content>
      </div>
      isMultiple: {{ rpdSelect.isMultiple$ | async }}
    </div>
  `,
  providers: [
    RpdSelectService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RpdSelectComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RpdSelectComponent implements ControlValueAccessor, OnInit {
  @Input() placeholder: string;
  @Output() change: EventEmitter<any> = new EventEmitter();
  @ViewChild('selectButton') selectButton: ElementRef;

  private propagateChange = (_: any) => {};
  private propagateTouch = () => {};
  currentLabel$: Observable<any>;
  hostKeyDown$: Subject<KeyboardEvent> = new Subject<KeyboardEvent>();
  hostVisibleKeyDown$: Observable<any>;

  constructor(private rpdSelect: RpdSelectService,
    private element: ElementRef) {
  }

  @Input() set disabled(isDisabled: any) {
    isDisabled || isDisabled === '' ? this.setDisabledState(true) :
      this.setDisabledState(!!isDisabled);
  }

  @Input() set multiple(isMultiple: any) {
    isMultiple || isMultiple === '' ? this.rpdSelect.toggleMultiple(true) :
      this.rpdSelect.toggleMultiple(!!isMultiple);
  }

  @HostListener('keydown', ['$event'])
  hostListenerKeyDown = event => this.hostKeyDown$.next(event);

  ngOnInit() {
    this.rpdSelect.value$.skip(1)
      .subscribe(value => {
        this.propagateChange(value);
        this.change.next(value);
      });

    // Updates current label when value changes
    this.currentLabel$ = this.rpdSelect.value$.skip(1)
      .do(value => console.log('Current label: ', {value}))
      .map(value => `Current Value: ${value}`);

    /**
     * Focus most recent option when select menu becomes visible and mark as
     * touched
     * Focus on select button when menu becomes invisible
     */
    this.rpdSelect.isVisible$.skip(1)
      .do(() => this.propagateTouch())
      .subscribe(isVisible => {
        isVisible ? this.rpdSelect.focusMostRecentOption() :
          this.focus();
      });

    // Keydown event stream filtered by visibility of select menu
    this.hostVisibleKeyDown$ =  this.hostKeyDown$
      .withLatestFrom(this.rpdSelect.isVisible$)
      .filter(([, isVisible]) => isVisible)
      .map(([event]) => event);

    // Keydown subscription when select menu is visible
    this.hostVisibleKeyDown$
      .subscribe(event => this.onVisibleHostKeyDown(event));

    /**
     * Debounced keyboard search of options when select menu is visible
     * - Maps event keyCode to a character
     * - Filters out non-word characters
     * - Buffers keydown events scheduled with a debounce
     * - Filters out emissions if no characters were captured
     * - Maps buffered characters to a string
     * - Gets latest value of options map
     * - Performs search with search string and options map
     */
    this.hostVisibleKeyDown$
      .map(event => this._mapKeyCodeToChar(event))
      .filter(char => this._isWordChar(char))
      .buffer(this.hostVisibleKeyDown$.debounceTime(SEARCH_DEBOUNCE))
      .filter(search => !!search.length)
      .map(search => search.join(''))
      .withLatestFrom(this.rpdSelect.options$)
      .subscribe(([searchStr, options]) => this.search(searchStr, options));
  }

  writeValue(value: any) {
    console.log('writeValue called', JSON.stringify({ value }));
    this.rpdSelect.updateValue(value);
  }

  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any) {
    this.propagateTouch = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.rpdSelect.toggleDisability(isDisabled);
  }

  toggleVisibility(event: Event) {
    event.preventDefault();
    this.rpdSelect.toggleVisibility();
  }

  focus() {
    this.selectButton.nativeElement.focus();
  }

  selectButtonKeyDown(event: KeyboardEvent) {
    switch(event.keyCode) {
      case KEY_CODES.ENTER:
      case KEY_CODES.SPACE:
        event.preventDefault();
        this.rpdSelect.toggleVisibility();
        break;
    }
  }

  onVisibleHostKeyDown(event: KeyboardEvent) {
    switch(event.keyCode) {
      case KEY_CODES.ESCAPE:
      case KEY_CODES.TAB:
        this.rpdSelect.toggleVisibility(false);
        break;

      case KEY_CODES.UP_ARROW:
        this.rpdSelect.focusPrevOption();
        break;

      case KEY_CODES.DOWN_ARROW:
        this.rpdSelect.focusNextOption();
        break;
    }
  }

  search(searchStr: string, options: Map<any, IRpdOption>) {
    const regex = new RegExp('^' + searchStr, 'i');
    const [option] = Array.from(options.values())
      .filter((option: IRpdOption) => option.label && regex.test(option.label));

    if (option) {
      this.rpdSelect.setFocus(option.instance);
    }
  }

  private _isWordChar(char) {
    return /\w/.test(char);
  }

  private _isNumPadKey(event: KeyboardEvent) {
    return event.location === NUMPAD_LOCATION &&
      event.keyCode >= KEY_CODES.NUMPAD0 &&
      event.keyCode <= KEY_CODES.NUMPAD9;
  }

  private _mapKeyCodeToChar(event: KeyboardEvent) {
    const numPadOffset = this._isNumPadKey(event) ? NUMPAD_OFFSET : 0;
    const keyCode = event.keyCode - numPadOffset;

    return String.fromCharCode(keyCode);
  }
}
