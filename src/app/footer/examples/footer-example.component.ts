import {
  Component
} from '@angular/core';

@Component({
  selector: 'footer-example',
  styles: [`
    .sample-form .form-horizontal .form-group {
      margin-left: 0px;
    }
    
    .padding-top-15 {
      padding-top: 15px;
    }
    
    .padding-bottom-15 {
      padding-bottom: 15px;
    }
  `],
  templateUrl: './footer-example.component.html'
})
export class FooterExampleComponent {
  constructor() {}
}
