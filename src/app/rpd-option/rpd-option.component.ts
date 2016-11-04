import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { Observable } from 'rxjs';
import { RpdSelectService, KEY_CODES } from '../rpd-select.service';

@Component({
  selector: 'rpd-option',
  template: `
    <div>
      <button (click)="updateValue($event, value)" #optionButton
        [style.background-color]="(isFocused$ | async) ? '#EEE' : 'initial'"
        [disabled]="disabled">
        <ng-content></ng-content>

        <span *ngIf="isSelected$ | async">
          <svg viewBox="0 0 100 80" style="height: 0.65rem; fill: currentcolor;">
            <polygon points="37.316,80.48 0,43.164 17.798,
              25.366 37.316,44.885 82.202,0 100,17.798 37.316,80.48" />
          </svg>
        </span>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RpdOptionComponent implements OnDestroy, OnInit {
  @Input() value: any;
  @ViewChild('optionButton') optionButton: ElementRef;

  private isFocused$: Observable<boolean>;
  private isSelected$: Observable<boolean>;
  // TODO: Add support for isMultiple
  // TODO: Figure out a clean way of exposing node.textContent for typeahead
  disabled: boolean = false;

  constructor(private rpdSelect: RpdSelectService) {
  }

  @Input('disabled')
  set isDisabled(isDisabled) {
    this.disabled = isDisabled || isDisabled === '' ? true : false;
  }

  @Input('selected')
  set isSelected(isSelected) {
    console.log('setting selected', this.value);
    if (!!isSelected || isSelected === '') {
      // TODO: Figure out a cleaner way of doing this
      // this.rpdSelect.updateValue(this.value);
      setTimeout(() => this.rpdSelect.updateValue(this.value));
    }
  }

  ngOnInit() {
    this.isSelected$ = this.rpdSelect.value$
      .map(value => value === this.value);

    this.isFocused$ = this.rpdSelect.focusedOption$
      .map(option => option === this)
      .delay(0) // Wait a tick for the DOM to stabilize
      .do(option => option && this.focus());
  }

  ngAfterViewInit() {
    this.rpdSelect.register({
      instance: this,
      label: this.optionButton.nativeElement.textContent.trim()
    });
  }

  ngOnDestroy() {
    this.rpdSelect.deregister(this);
  }

  updateValue(event: Event, value: any) {
    event.preventDefault();
    this.rpdSelect.updateValue(value);
    this.rpdSelect.setFocus(this);
    this.rpdSelect.toggleVisibility(false);
  }

  focus() {
    this.optionButton.nativeElement.focus();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch(event.keyCode) {
      case KEY_CODES.ENTER:
        this.updateValue(event, this.value);
        break;
    }
  }
}
