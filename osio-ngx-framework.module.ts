import { NgModule } from '@angular/core';

import { FrameworkServicesModule } from './src/app/framework-services/framework-services.module';
import { SampleModule } from './src/app/sample/sample.module';

@NgModule({
  imports: [],
  exports: [
    FrameworkServicesModule,
    SampleModule
  ]
})
export class OSIONGXFrameworkModule {
}
