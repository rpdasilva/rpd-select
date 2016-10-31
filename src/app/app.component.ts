import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  items = [
    { label: 'Empty', value: undefined },
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
    { label: 'Option 3', value: 3 },
    { label: 'Option 4', value: 4 },
    { label: 'Option 5', value: 5 }
  ];

  constructor() {
    setTimeout(() => {
      this.items = this.items.filter(item => item.value > 2 || item.value === undefined);
    }, 1000);
  }

  submit(form) {
    console.log('Form: ', form);
  }

  formValue(form) {
    return JSON.stringify(form.value);
  }
}
