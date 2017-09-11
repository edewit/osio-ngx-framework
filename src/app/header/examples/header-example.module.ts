import { NgModule }  from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsModule, TabsetConfig } from 'ngx-bootstrap/tabs';

import { DemoComponentsModule } from '../../../demo/components/demo-components.module';
import { HeaderModule } from '../header.module';
import { HeaderExampleComponent } from './header-example.component';

@NgModule({
  imports: [
    CommonModule,
    DemoComponentsModule,
    FormsModule,
    HeaderModule,
    TabsModule.forRoot()
  ],
  declarations: [ HeaderExampleComponent ],
  exports: [ HeaderExampleComponent ],
  providers: [ TabsetConfig ]
})
export class FooterExampleModule {
  constructor() {}
}
