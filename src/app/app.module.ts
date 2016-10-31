import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

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
    HttpModule
  ],
  providers: [RpdSelectService],
  bootstrap: [AppComponent]
})
export class AppModule { }
