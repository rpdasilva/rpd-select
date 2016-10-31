import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RpdSelectService } from '../rpd-select.service';

@Component({
  selector: 'rpd-option',
  template: `
    <div>
      <button (click)="updateValue($event, value)">
        <ng-content></ng-content>

        <span *ngIf="isSelected | async">
          <svg viewBox="0 0 100 80" style="height: 0.65rem; fill: currentcolor;">
            <polygon points="37.316,80.48 0,43.164 17.798,
              25.366 37.316,44.885 82.202,0 100,17.798 37.316,80.48" />
          </svg>
        </span>
        <span *ngIf="isFocused | async">
          Focused
        </span>
      </button>
    </div>
  `
})
export class RpdOptionComponent implements OnDestroy, OnInit {
  @Input() value: any;

  private isSelected: Observable<boolean>;
  private isFocused: Observable<boolean>;

  constructor(private rpdSelect: RpdSelectService,
    public element: ElementRef) {
    this.rpdSelect.register(this, element);
  }

  ngOnInit() {
    this.isSelected = this.rpdSelect.value
      .map(value => value === this.value);

    this.isFocused = this.rpdSelect.focusedOption
      .filter(option => option === this);
  }

  ngOnDestroy() {
    this.rpdSelect.deregister(this);
  }

  updateValue(event: Event, value: any) {
    event.preventDefault();
    this.rpdSelect.updateValue(value);
    this.rpdSelect.focus(this);
    // this.rpdSelect.toggleVisibility(false);
  }
}
