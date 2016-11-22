import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { RpdSelectComponent } from './rpd-select/rpd-select.component';
import { RpdSelectService } from './rpd-select.service';
import { RpdOptionComponent } from './rpd-option/rpd-option.component';

@NgModule({
  declarations: [
    AppComponent,
    RpdSelectComponent,
    RpdOptionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [RpdSelectService],
  bootstrap: [AppComponent]
})
export class AppModule { }
