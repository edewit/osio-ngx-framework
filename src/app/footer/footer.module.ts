import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrameworkServicesModule } from './../framework-services/framework-services.module';

import { FooterComponent } from './footer.component';

/**
 * A module containing objects associated with the footer component
 */
@NgModule({
  imports: [ CommonModule, FrameworkServicesModule ],
  declarations: [ FooterComponent ],
  exports: [ FooterComponent ]
})
export class FooterModule { }
