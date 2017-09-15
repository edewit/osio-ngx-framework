import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BsDropdownConfig, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { Logger } from 'ngx-base';

import { FrameworkServicesModule } from './../framework-services/framework-services.module';

import { HeaderService } from './header.service';
import { HeaderComponent } from './header.component';

/**
 * A module containing objects associated with the header component
 */
@NgModule({
  imports: [ 
    CommonModule,
    BsDropdownModule.forRoot(),
    FrameworkServicesModule 
  ],
  declarations: [ HeaderComponent ],
  exports: [ HeaderComponent ],
  providers: [ BsDropdownConfig, HeaderService, Logger ]
})
export class HeaderModule { }
