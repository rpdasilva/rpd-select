import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  form2: FormGroup;
  items = [
    { label: 'Null', value: undefined },
    { label: 'Foo 1', value: 1 },
    { label: 'Bar 2', value: 2 },
    { label: 'Baz 3', value: 3 },
    { label: 'Quz 4', value: 4 }
  ];

  constructor(private fb: FormBuilder) {
    // setTimeout(() => {
    //   this.items = this.items.filter(item => item.value > 2 || item.value === undefined);
    // }, 1000);

    this.constructForm(fb);
  }

  submit(form) {
    console.log('Form: ', form);
  }

  formValue(form) {
    return JSON.stringify(form.value);
  }

  onChange(type, event) {
    console.log(`Change: ${type}`, event);
  }

  constructForm(fb: FormBuilder) {
    this.form2 = fb.group({
      'rpd-select': [''],
      test: [''],
      check: ['']
    });
    console.log(this.form2);
  }
}
