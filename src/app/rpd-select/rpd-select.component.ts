import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnInit,
  ViewChild,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { KEY_CODES, RpdSelectService } from '../rpd-select.service';

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
      {{ rpdSelect.isMultiple$ | async }}
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
  @ViewChild('selectButton') selectButton: ElementRef;

  private propagateChange = (_: any) => {};
  private propagateTouch = () => {};
  currentLabel$: Observable<any>;

  constructor(private rpdSelect: RpdSelectService) {
  }

  @Input() set disabled(isDisabled: any) {
    isDisabled || isDisabled === '' ? this.setDisabledState(true) :
      this.setDisabledState(!!isDisabled);
  }

  @Input() set multiple(isMultiple: any) {
    isMultiple || isMultiple === '' ? this.rpdSelect.toggleMultiple(true) :
      this.rpdSelect.toggleMultiple(!!isMultiple);
  }

  ngOnInit() {
    this.rpdSelect.value$.skip(2)
      .subscribe(value => this.propagateChange(value));

    this.rpdSelect.isVisible$.skip(1)
      .do(() => this.propagateTouch())
      .subscribe(isVisible => {
        isVisible ? this.rpdSelect.focusMostRecentOption() :
          this.focus();
      });

    this.currentLabel$ = this.rpdSelect.value$.skip(2)
      .do(value => console.log('Current label: ' + value))
      .map(value => `Current Value: ${value}`);
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

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
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
}
