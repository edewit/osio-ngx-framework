import {
  Component
} from '@angular/core';
import { User, Profile } from "ngx-login-client";
import { Context, ContextType, Space } from "ngx-fabric8-wit";
import { MenuItem } from "src/app/header/menu-item";
import { SystemStatus } from "src/app/header/system-status";

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

  loggedInUserText: string;
  currentContextText: string;
  recentContextsText: string;
  systemStatusText: string;
  followedLinkText: string;
  
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

  constructor() {

    this.loggedInUser = {
      id: 'user-1',
      attributes: {
        username: 'exampleuser',
        fullName: 'Example User'
      } as Profile
    } as User;
    this.loggedInUserText = JSON.stringify(this.loggedInUser);
    
    this.currentContext = {
      user: this.loggedInUser,
      space: {
        name: 'spaceName'
      } as Space,
      type: { 
        name: 'contextTypeName',
        icon: 'fa fa-heart',
        menus: [
          {
            id: 'm0',
            name: 'Menu Entry 0',
            icon: 'fa fa-heart',
            active: true,
            fullPath: '_menuEntry0',
            menus: [
              {
                id: 'm01',
                name: 'Submenu Entry 0-1',
                icon: 'fa fa-heart',
                fullPath: '_menuEntry0_1',
              } as MenuItem,
              {
                id: 'm02',
                name: 'Submenu Entry 0-2',
                icon: 'fa fa-heart',
                fullPath: '_menuEntry0_2',
              } as MenuItem,        
            ] as MenuItem[]
          } as MenuItem,
          {
            id: 'm1',
            name: 'Menu Entry 1',
            icon: 'fa fa-heart',
            fullPath: '_menuEntry1',
            menus: [
              {
                id: 'm11',
                name: 'Submenu Entry 1-1',
                icon: 'fa fa-heart',
                fullPath: '_menuEntry1_1',
              } as MenuItem,
              {
                id: 'm12',
                name: 'Submenu Entry 1-2',
                icon: 'fa fa-heart',
                fullPath: '_menuEntry1_2',
              } as MenuItem,        
            ] as MenuItem[]
          } as MenuItem,
          {
            id: 'm2',
            name: 'Menu Entry 2',
            icon: 'fa fa-heart',
            extUrl: 'http://ext.url/',
          } as MenuItem,
        ] as MenuItem[]
      } as ContextType,
      path: 'contextPath',
      name: 'contextName'
    } as Context;
    this.currentContextText = JSON.stringify(this.currentContext);
    
    this.recentContexts = [
      {
        user: this.loggedInUser,
        space: {
          name: 'spaceNameRecent0'
        } as Space,
        type: { 
          name: 'contextTypeNameRecent0',
          icon: 'fa fa-heart'
        } as ContextType,
        path: 'contextPathRecent0',
        name: 'contextNameRecent0'
      },
      {
        user: this.loggedInUser,
        space: {
          name: 'spaceNameRecent1'
        } as Space,
        type: { 
          name: 'contextTypeNameRecent1',
          icon: 'fa fa-heart'
        } as ContextType,
        path: 'contextPathRecent1',
        name: 'contextNameRecent1'
      }
    ] as Context[];
    this.recentContextsText = JSON.stringify(this.recentContexts);
    
    this.systemStatus = [
      {
        name: "Some Subsystem",
        statusOk: true
      } as SystemStatus,
      {
        name: "Some Other Subsystem",
        statusOk: false
      } as SystemStatus      
    ]
    this.systemStatusText = JSON.stringify(this.systemStatus);
  }
}
