import { Component, ViewEncapsulation } from '@angular/core';
import { AboutService } from '../framework-services/about.service';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'osio-app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.less'],
})

export class FooterComponent {
  constructor(public about: AboutService) { }
}
