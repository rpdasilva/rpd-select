import {
  Component,
  HostListener,
  Input,
  OnInit,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { RpdSelectService } from '../rpd-select.service';

/**
 * Common Keyboard actions and their associated keycode.
 */
const KEY_CODES = {
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

@Component({
  selector: 'rpd-select',
  template: `
    <div>
      <button (click)="toggleVisibility($event)"
        >{{ (currentLabel | async) || placeholder }}
        <svg viewBox="0 0 10 10" style="height: 0.5rem; fill: currentcolor;">
          <polygon points="0 0,10 0,5 10" />
        </svg>
      </button>

      <div *ngIf="rpdSelect.isVisible | async">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  providers: [
    RpdSelectService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RpdSelectComponent),
      multi: true
    }
  ]
})
export class RpdSelectComponent implements ControlValueAccessor, OnInit {
  @Input() placeholder: string;

  private propagateChange = (_: any) => {};
  private propagateTouch = () => {};
  currentLabel: Observable<any>;

  constructor(private rpdSelect: RpdSelectService) {
  }

  ngOnInit() {
    this.rpdSelect.value.skip(2)
      .do(val => console.log('Value:', val))
      .subscribe(value => this.propagateChange(value));

    this.rpdSelect.isVisible.subscribe(() => this.propagateTouch());

    this.currentLabel = this.rpdSelect.value
      .map(value => `Current Value: ${value}`);
  }

  writeValue(value: any) {
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

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    console.log('keydown', event);
  }
}
