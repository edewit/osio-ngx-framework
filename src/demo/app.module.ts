import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// App components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Example modules
import { SampleExampleModule } from '../app/sample/examples/sample-example.module';
import { FooterExampleModule } from '../app/footer/examples/footer-example.module';
import { HeaderExampleModule } from '../app/header/examples/header-example.module';

import { WelcomeComponent } from './components/welcome.component';

@NgModule({
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    SampleExampleModule,
    FooterExampleModule,
    HeaderExampleModule
  ],
  declarations: [
    AppComponent,
    WelcomeComponent
  ],
  providers: [
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
