import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrameworkServicesModule } from './../framework-services/framework-services.module';

import { HeaderComponent } from './header.component';

/**
 * A module containing objects associated with the header component
 */
@NgModule({
  imports: [ CommonModule, FrameworkServicesModule ],
  declarations: [ HeaderComponent ],
  exports: [ HeaderComponent ]
})
export class HeaderModule { }
