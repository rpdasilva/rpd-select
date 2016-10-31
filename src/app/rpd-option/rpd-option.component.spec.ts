/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RpdOptionComponent } from './rpd-option.component';

describe('RpdOptionComponent', () => {
  let component: RpdOptionComponent;
  let fixture: ComponentFixture<RpdOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RpdOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RpdOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
