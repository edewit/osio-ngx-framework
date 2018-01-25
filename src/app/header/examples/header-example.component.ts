import {
  Component, NgZone
} from '@angular/core';

import { User, Profile } from 'ngx-login-client';
import { Context, ContextType, Space } from 'ngx-fabric8-wit';

import { MenuItem } from '../menu-item';
import { ContextLink } from '../context-link';
import { SystemStatus } from '../system-status';
import { HeaderService } from '../header.service';

@Component({
  selector: 'header-example',
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

    .input-label {
      font-weight: bold;
    }

    .input-textarea {
      width: 100%;
      height: 150px;
      font-size: 70%;
    }

    .event-label {
      font-weight: bold;
    }

    .event-value {
      font-weight: normal;
    }

    .event-textarea {
      width: 100%;
      height: 100%;
      font-size: 70%;
    }

    .event-value-onoff {
      font-weight: normal;
      color: lightgrey;
    }

    .event-active {
      color: red;
    }
  `],
  templateUrl: './header-example.component.html'
})
export class HeaderExampleComponent {

  systemContext: string;
  loggedInUser: User;
  currentContext: Context;
  recentContexts: Context[];
  systemStatus: SystemStatus[];

  selectRecentContextEventText: string;
  selectMenuItemEventText: string;
  selectViewAllSpacesEventText: string;
  selectAccountHomeEventText: string;
  selectCreateSpaceEventText: string;
  selectUserProfileEventText: string;
  selectLogoutEventText: string;
  selectLoginEventText: string;
  selectAboutEventText: string;

  systemContextText: string;
  loggedInUserText: string;
  currentContextText: string;
  recentContextsText: string;
  systemStatusText: string;
  followedLinkText: string;

  loggedInUserServiceText: string;
  currentContextServiceText: string;
  recentContextsServiceText: string;
  systemStatusServiceText: string;
  followedLinkServiceText: string;
  setSystemStatusServiceText: string;
  addRecentContextServiceText: string;

  onSelectRecentContext(context: Context) {
    this.selectRecentContextEventText = context?JSON.stringify(context):'isNil';
  }

  onSelectMenuItem(menuItem: MenuItem) {
    this.selectMenuItemEventText = menuItem?JSON.stringify(menuItem):'isNil';
  }

  onSelectViewAllSpaces() {
    this.selectViewAllSpacesEventText = 'clicked';
    setTimeout(() => { this.selectViewAllSpacesEventText = ''}, 1000);
  }

  onSelectAccountHome() {
    this.selectAccountHomeEventText = 'clicked';
    setTimeout(() => { this.selectAccountHomeEventText = ''}, 1000);
  }

  onSelectUserProfile() {
    this.selectUserProfileEventText = 'clicked';
    setTimeout(() => { this.selectUserProfileEventText = ''}, 1000);
  }

  onSelectCreateSpace() {
    this.selectCreateSpaceEventText = 'clicked';
    setTimeout(() => { this.selectCreateSpaceEventText = ''}, 1000);
  }

  onSelectLogout() {
    this.selectLogoutEventText = 'clicked';
    setTimeout(() => { this.selectLogoutEventText = ''}, 1000);
  }

  onSelectLogin() {
    this.selectLoginEventText = 'clicked';
    setTimeout(() => { this.selectLoginEventText = ''}, 1000);
  }

  onSelectAbout() {
    this.selectAboutEventText = 'clicked';
    setTimeout(() => { this.selectAboutEventText = ''}, 1000);
  }

  onFollowedLink(url: string) {
    this.followedLinkText = url;
  }

  parseJSON(input: string): any {
    return JSON.parse(input);
  }

  bootstrapService() {
    this.headerService.clean();

    let user: User = {
      id: 'user-1-service',
      attributes: {
        username: 'exampleuserservice',
        fullName: 'Example User Service'
      } as Profile
    } as User;

    let space0: Space = {
      name: 'spaceName0-service'
    } as Space;

    let space1: Space = {
      name: 'spaceName1-service'
    } as Space;

    let space2: Space = {
      name: 'spaceName2-service'
    } as Space;

    let context0 = this.headerService.createContext('Context 0', 'path0', space0, user);
    let context1 = this.headerService.createContext('Context 1', 'path1', space1, user);
    let context2 = this.headerService.createContext('Context 2', 'path2', space2, user);

    let systemStatus0: SystemStatus = {
        id: 'status0-service',
        name: 'Some Subsystem Service',
        statusOk: true
      } as SystemStatus;

    let systemStatus1: SystemStatus = {
      id: 'status1-service',
      name: 'Some Subsystem Service',
      statusOk: true
    } as SystemStatus;

    this.headerService.persistUser(user);
    this.loggedInUserText = JSON.stringify(user);

    this.headerService.persistCurrentContext(context0);
    this.currentContextText = JSON.stringify(context0);

    this.headerService.addRecentContext(context1);
    this.headerService.addRecentContext(context2);
    this.recentContextsText = JSON.stringify([context1, context2]);

    this.headerService.updateSystemStatus(systemStatus0);
    this.headerService.updateSystemStatus(systemStatus1);
    this.systemStatusText = JSON.stringify([systemStatus0, systemStatus1]);
  }

  bootstrapInputs() {
    this.headerService.clean();

    let user: User = {
      id: 'user-1-inputs',
      attributes: {
        username: 'exampleuserinputs',
        fullName: 'Example User Inputs'
      } as Profile
    } as User;

    let space0: Space = {
      name: 'spaceName0-inputs'
    } as Space;

    let space1: Space = {
      name: 'spaceName1-inputs'
    } as Space;

    let space2: Space = {
      name: 'spaceName2-inputs'
    } as Space;

    let context0 = this.headerService.createContext('Context 0', 'path0', space0, user);
    let context1 = this.headerService.createContext('Context 1', 'path1', space1, user);
    let context2 = this.headerService.createContext('Context 2', 'path2', space2, user);

    let systemStatus0: SystemStatus = {
        id: 'status0-inputs',
        name: 'Some Subsystem Inputs',
        statusOk: true
      } as SystemStatus;

    let systemStatus1: SystemStatus = {
      id: 'status1-service',
      name: 'Some Subsystem Inputs',
      statusOk: true
    } as SystemStatus;

    this.loggedInUser = user;
    this.loggedInUserText = JSON.stringify(this.loggedInUser);

    this.currentContext = context0;
    this.currentContextText = JSON.stringify(context0);

    this.recentContexts = [ context1, context2 ] as Context[];
    this.recentContextsText = JSON.stringify(this.recentContexts);

    this.systemStatus = [ systemStatus0, systemStatus0 ] as SystemStatus[];
    this.systemStatusText = JSON.stringify(this.systemStatus);
  }

  constructor(private headerService: HeaderService, private ngZone: NgZone) {
    // listen to changes on the service. If a change is coming in,
    // update the serviceTexts and update the localTexts. We don't set
    // the actual values here in the example as they are not used
    // anymore.
    headerService.retrieveCurrentContext().subscribe(value => {
      this.currentContextServiceText = JSON.stringify(value)
      this.currentContextText = JSON.stringify(value);
    });
    headerService.retrieveRecentContexts().subscribe(value => {
      this.recentContextsServiceText = JSON.stringify(value)
      this.recentContextsText = JSON.stringify(value);
    });
    headerService.retrieveSystemStatus().subscribe(value => {
      this.systemStatusServiceText = JSON.stringify(value)
      this.systemStatusText = JSON.stringify(value);
    });
    headerService.retrieveUser().subscribe(value => {
      this.loggedInUserServiceText = JSON.stringify(value)
      this.loggedInUserText = JSON.stringify(value);
    });

    this.systemContext = 'planner';
    this.systemContextText = this.systemContext;

    this.setSystemStatusServiceText = JSON.stringify({
      id: 'exampleSystemId0',
      name: 'Some Example System',
      statusOk: true
    });

    this.addRecentContextServiceText = JSON.stringify({
      user: {
        id: 'user-x',
        attributes: {
          username: 'exampleuserX',
          fullName: 'Example UserX'
        } as Profile
      } as User,
      space: {
        name: 'spaceNameRecentX'
      } as Space,
      type: {
        name: 'contextTypeNameRecentX',
        icon: 'fa fa-heart'
      } as ContextType,
      path: 'contextPathRecentX',
      name: 'contextNameRecentX'
    } as Context);

    const eventBus: any = (window as any)['EventBus'];
    eventBus.addEventListener('loggedin', (event:any) => {
      ngZone.run(() => this.loggedInUser = event.target);
    });
  }
}
