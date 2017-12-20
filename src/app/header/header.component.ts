import { Subscription, Observable } from 'rxjs';

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { Logger } from 'ngx-base';
import { UserService, User } from 'ngx-login-client';
import { ContextType, Context } from 'ngx-fabric8-wit';

import { HeaderService } from "./header.service";
import { MenuItem } from './menu-item';
import { MenuedContextType } from './menued-context-type';
import { ContextLink } from './context-link';
import { SystemStatus } from "./system-status";

// TODO: wir brauchen einen weg, wie man boostrappt.

/*
 * This is a re-usable header component that is able to persist the state
 * of all involved data on page reloads (or application switches on the same
 * domain). It uses localStorage for this. Goals are:
 *  - make the component as non-semantic as possible given the existing data structure.
 *  - make the component rely on event behaviour of enclosing components.
 *  - make the storage of the data as transaprent as possible for enclosing components.
 * The overall goal is to create a component that works like any other Angular
 * component but across application boundaries - it should preserve it's data on
 * application switches as it would be doing it in a single SPA.
 * 
 * Values in the attributes at init time are getting ignored. Or in other words: 
 * on bootstrap, values in localStorage always take precedence over local attribute 
 * values to the component. If there are no values stored in localStorage, an empty
 * set of values is created. Updating @Input values is possible after boostrapping.
 * If you need to update the values, use either the attributes or the headerService. 
 * Both ways work either way, always storing changes in localStorage immediately.
 * 
 * It is recommended to always use the service to change the values instead of
 * @Input values.
 */
@Component({
  selector: 'osio-app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
  providers: []
})
export class HeaderComponent implements OnChanges, OnInit, OnDestroy { 

  // if this is set to false or is unset, the component will not
  // automatically follow MenuItem.fullPath or MenuItem.extUrl 
  // links. The event is emitted in both cases, so if this is 
  // set to false or is unset, the enclosing component has to 
  // do the routing based on that events. Default is false.
  @Input("followLinks")
  private followLinks: Boolean = false;
  
  // the system context, this determines which ContextLink is considered.
  @Input("systemContext")
  private systemContext: string;

  // user logged in
  @Input("user")
  private user: User;

  // current context
  @Input("currentContext")
  private currentContext: Context;

  // system status
  @Input("systemStatus")  
  private systemStatus: SystemStatus[];

  // recent contexts
  @Input("recentContexts")
  private recentContexts: Context[];

  @Output("onSelectRecentContext")
  private onSelectRecentContext: EventEmitter<Context> = new EventEmitter<Context>();

  @Output("onSelectMenuItem")
  private onSelectMenuItem: EventEmitter<MenuItem> = new EventEmitter<MenuItem>();

  @Output("onSelectViewAllSpaces")
  private onSelectViewAllSpaces: EventEmitter<void> = new EventEmitter<void>();

  @Output("onSelectAccountHome")
  private onSelectAccountHome: EventEmitter<void> = new EventEmitter<void>();

  @Output("onSelectCreateSpace")
  private onSelectCreateSpace: EventEmitter<void> = new EventEmitter<void>();

  @Output("onSelectUserProfile")
  private onSelectUserProfile: EventEmitter<void> = new EventEmitter<void>();

  @Output("onSelectLogout")
  private onSelectLogout: EventEmitter<void> = new EventEmitter<void>();

  @Output("onSelectLogin")
  private onSelectLogin: EventEmitter<void> = new EventEmitter<void>();

  @Output("onSelectAbout")
  private onSelectAbout: EventEmitter<void> = new EventEmitter<void>();

  @Output("onFollowedLink")
  private onFollowedLink: EventEmitter<string> = new EventEmitter<string>();

  // navbar collapse state
  private isNavbarVisible: Boolean = false;
    
  // avatar loaded state
  private avatarLoaded: Boolean = false;

  // active top menu item
  private activeTopLevelMenu: MenuItem;

  // active submenu item
  private activeSubMenu: MenuItem;
    
  // this prevents changes to the @Input values until the service is being started
  private changesEnabled = false;

  // the event listeners for listening to url changes to update menu states
  private eventListeners: any[] = [];

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private logger: Logger,
    private headerService: HeaderService
  ) {
    this.logger.log("[HeaderComponent] initialized.");
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentContext && changes.currentContext.currentValue) {
      // current context has changed, we need to update the menu,
      // setting the new context to the active menu.
      let newContext: Context = changes.currentContext.currentValue;
      if (newContext)
        this.logger.log("[HeaderComponent] detected changes to currentContext: " + newContext.name);
      this.setCurrentContext(newContext);
      this.logger.log("[HeaderComponent] syncing detected changes to currentContext to persistence storage.");
      if (this.changesEnabled)
        this.headerService.persistCurrentContext(this.currentContext);
    } else if (changes.recentContexts && changes.recentContexts.currentValue) {
      let newRecentContexts: Context[] = changes.recentContexts.currentValue;
      this.logger.log("[HeaderComponent] detected changes to recentContexts.");
      this.recentContexts = newRecentContexts;
      this.logger.log("[HeaderComponent] syncing detected changes to recentContexts to persistence storage.");
      if (this.changesEnabled)
        this.headerService.persistRecentContexts(this.recentContexts);
    } else if (changes.user && changes.user.currentValue) {
      let newUser: User = changes.user.currentValue;
      this.logger.log("[HeaderComponent] detected changes to user: " + newUser.id);
      this.user = newUser;
      this.logger.log("[HeaderComponent] syncing detected changes to user to persistence storage.");
      if (this.changesEnabled)
        this.headerService.persistUser(this.user);      
    } else if (changes.systemStatus && changes.systemStatus.currentValue) {
      let newSystemStatus: any = changes.systemStatus.currentValue;
      this.logger.log("[HeaderComponent] detected changes to systemStatus: " + newSystemStatus.id);
      this.systemStatus = newSystemStatus;
      this.logger.log("[HeaderComponent] syncing detected changes to newSystemStatus to persistence storage.");
      if (this.changesEnabled)
        this.headerService.persistSystemStatus(this.systemStatus);      
    } else if (changes.systemContext && changes.systemContext.currentValue) {
      this.logger.log("[HeaderComponent] systemContext changed to " + this.systemContext);      
    } else {
      this.logger.log("[HeaderComponent] detected changes to unknown attribute: " + JSON.stringify(changes));
    }
  }

  // this is called after the first ngOnChanges() is called.
  ngOnInit(): void {
    // listen to incoming updates from the service, the service will only send a null
    // value if there is nothing stored in localStorage, never when erasing it (see 
    // headerService.clear().
    this.headerService.retrieveCurrentContext().subscribe(value => { 
      this.logger.log("[HeaderComponent] incoming service change to currentContext: " + JSON.stringify(value));
      this.setCurrentContext(value)
    });
    this.headerService.retrieveRecentContexts().subscribe(value => {
      this.logger.log("[HeaderComponent] incoming service change to recentContexts: " + JSON.stringify(value));
      this.recentContexts = value
    });
    this.headerService.retrieveSystemStatus().subscribe(value => {
      this.logger.log("[HeaderComponent] incoming service change to systemStatus: " + JSON.stringify(value));
      this.systemStatus = value
    });
    this.headerService.retrieveUser().subscribe(value => {
      this.logger.log("[HeaderComponent] incoming service change to user: " + JSON.stringify(value));
      this.user = value
    });
    // we now allow changes to be propagated. We need this because the localStorage values
    // should have precedence while still being able to detect changes to the @Input attributes.
    // TODO: persist everything
    this.changesEnabled = true;
    // subscribe to changes to the url address to update the menu state
    this.eventListeners.push(
      this.router.events.subscribe((val) => {
        if (val instanceof NavigationEnd) {
          this.updateMenuActiveState();
        }
      })
    );
    // update the menu active state from the url on init
    this.updateMenuActiveState();
  }

  ngOnDestroy() {
    this.eventListeners.forEach(e => e.unsubscribe());
  }

  // this retrieves the current url of the browser and sets the
  // matching MenuItem in currentContext to active, selecting it.
  // This allows for deep links to arbitrary menu selections.
  private updateMenuActiveState(): any {
    let url = this.router.url;
    this.logger.log("[HeaderComponent] updating menu state from current url: " + url + " decoded:" + decodeURIComponent(url));
    if (this.currentContext && this.currentContext.type && this.currentContext.type.hasOwnProperty('menus')) {
      let foundPath = false;
      let menus = (this.currentContext.type as MenuedContextType).menus;
      for (let n of menus) {
        // clear the active state
        n.active = false;
        // lets go in reverse order to avoid matching
        // /namespace/space/create instead of /namespace/space/create/pipelines
        // as the 'Create' page matches to the 'Codebases' page
        let subMenus = (n.menus || []).slice().reverse();
        if (subMenus) {
          for (let o of subMenus) {
            // clear the active state
            o.active = false;
            // if the submenu has contextLinks, iterate over them
            if (!foundPath && o.contextLinks && o.contextLinks.length>0) {
              let cp: ContextLink;
              for (cp of o.contextLinks) {
                // if a context link matches the systemContext and has the matching path, activate the submenu and the topmenu
                if (cp.context===this.systemContext && cp.type==='internal' && cp.path === decodeURIComponent(url)) {
                  this.logger.log("[HeaderComponent] found router path in submenu menus: " + cp.path);
                  foundPath = true;
                  o.active = true;
                  n.active = true;  
                }
              }
            }
          }
          // if still not found, lets check if the url matches part of the path
          if (!foundPath) {
            for (let o of subMenus) {
              let cp: ContextLink;
              for (cp of o.contextLinks) {
                if (!foundPath && cp.context===this.systemContext && cp.type==='internal' && decodeURIComponent(url).startsWith(cp.path + "/")) {
                  this.logger.log("[HeaderComponent] found router path matching submenu menus: " + cp.path);
                  foundPath = true;
                  o.active = true;
                  n.active = true;
                }
              }
            }
          }
          // routes that can't be correctly matched based on the url should use the parent path
          if (!foundPath && this.router.routerState.snapshot.root.firstChild) {
            for (let o of subMenus) {
              let cp: ContextLink;
              for (cp of o.contextLinks) {
                let parentPath = decodeURIComponent('/' + this.router.routerState.snapshot.root.firstChild.url.join('/'));
                if (!foundPath && cp.context===this.systemContext && cp.type==='internal' && o.path === parentPath) {
                  this.logger.log("[HeaderComponent] found router parent path in submenu menus: " + cp.path + " parentPath: " + parentPath);
                  foundPath = true;
                  o.active = true;
                  n.active = true;
                }
              }
            }
          }
        } else if (n.contextLinks && n.contextLinks.length>0) {
          let cp: ContextLink;
          for (cp of n.contextLinks) {
            if (cp.context===this.systemContext && cp.type==='internal' && cp.path === url) {
              this.logger.log("[HeaderComponent] found router path in toplevel menus: " + cp.path);
              n.active = true;
              foundPath = true;
            }
          }
        } else {
          this.logger.log("[HeaderComponent] router path not found in menus: " + url);
        }
      }
    } else {
      // currentContext has no menus
      this.logger.log("[HeaderComponent] the currentContext has no menus");
    }
    this.logger.log("[HeaderComponent] completed matching url to menus");
  }

  // sets a new context; will also be called from
  // ngOnChanges when the current context changes
  // to update the menus
  private setCurrentContext(context: Context) {
    // store the new context
    this.currentContext = context;
    // update the active menu, set to non-active
    if (this.activeTopLevelMenu) {
      this.activeTopLevelMenu.active = false;
    }
    if (context) {
      this.logger.log("[HeaderComponent] set current context to " + context.name);
      // set the new context menu
      let menus = (this.currentContext.type as MenuedContextType).menus;
      this.activeTopLevelMenu = menus[0];
      this.activeTopLevelMenu.active = true;  
    } else {
      this.logger.log("[HeaderComponent] unset current context");      
    }
  }

  // toggle navbar collapse
  private toggleState() { 
      this.isNavbarVisible = this.isNavbarVisible === false ? true : false;
  }
  
  private selectRecentContext(context: Context) {
    // making this automatic routing the user to
    // the context.fullPath would require adding an
    // alternative way for extUrls here. This would mean
    // breaking the model (we would need another field in
    // Context, which is not easily possible from this
    // module). Therefore, we only emit the event and
    // let the enclosing component route the user. 
    if (context)
      this.logger.log("[HeaderComponent] selected recent context: " + context.name);
    this.onSelectRecentContext.emit(context);
  }

  private viewAllSpaces() {
    // we only emit the event and let the enclosing component do the routing
    // based on the application configuration.
    // likely target in production: [routerLink]="[user.attributes.username,'_spaces']"
    this.logger.log("[HeaderComponent] selected 'viewAllSpaces'");    
    this.onSelectViewAllSpaces.emit();
  }

  private accountHome() {
    // we only emit the event and let the enclosing component do the routing
    // based on the application configuration.
    // likely target in production: [routerLink]="['_home']"
    this.logger.log("[HeaderComponent] selected 'accountHome'");    
    this.onSelectAccountHome.emit();
  }

  private userProfile() {
    // we only emit the event and let the enclosing component do the routing
    // based on the application configuration.
    // likely target in production: [routerLink]="[user.attributes.username]"
    this.logger.log("[HeaderComponent] selected 'userProfile'");    
    this.onSelectUserProfile.emit();
  }

  private logout() {
    this.logger.log("[HeaderComponent] selected 'logout'");
    // TODO: clear localStorage(?)
    this.onSelectLogout.emit();
  }

  private login() {
    this.logger.log("[HeaderComponent] selected 'login'");    
    this.onSelectLogin.emit();
  }

  private createSpace() {
    this.logger.log("[HeaderComponent] selected 'createSpace'");
    this.onSelectCreateSpace.emit();
  }

  private menuSelect(menuItem: MenuItem) {
    this.goTo(menuItem);
    if (menuItem)
      this.logger.log("[HeaderComponent] selected topmenu: " + menuItem.name);
    if (this.activeTopLevelMenu) {
      this.activeTopLevelMenu.active = false;
    }
    menuItem.active = true;
    this.activeTopLevelMenu = menuItem;
    this.onSelectMenuItem.emit(menuItem);
  }

  private secondaryMenuSelect(menuItem: MenuItem) {
    this.goTo(menuItem);
    // TODO: this may need to also send [queryParams]="plannerFollowQueryParams"
    if (menuItem)
      this.logger.log("[HeaderComponent] selected submenu: " + menuItem.name);
    if (this.activeSubMenu) {
      this.activeSubMenu.active = false;
    }
    menuItem.active = true;
    this.activeSubMenu = menuItem;
    this.onSelectMenuItem.emit(menuItem);
  }

  private about() {
    this.logger.log("[HeaderComponent] selected 'about'");
    this.onSelectAbout.emit();
  }

  // this executes the link, based on what link type the menuItem is of.
  // The value of systemContext determines which ContextLink is being taken.
  private goTo(menuItem: MenuItem) {
    this.logger.log("[HeaderComponent] goTo called for menuItem " + menuItem.id);
    if (menuItem.contextLinks) {
      for (let i=0; i<menuItem.contextLinks.length; i++) {
        let thisContextLink = menuItem.contextLinks[i];
        if (thisContextLink.context===this.systemContext) {
          this.logger.log("[HeaderComponent] found contextLink matching systemContext for menuItem " + menuItem.id);
          if (thisContextLink.type==="external") {
            // this is an external URL
            this.onFollowedLink.emit("[external] " + thisContextLink.path);
            // TODO: store all data to localStorage
            if (this.followLinks) {
              this.logger.log("[HeaderComponent] routing to external url " + thisContextLink.path);
              this.headerService.routeToExternal(thisContextLink, window);
            } else {
              this.logger.log("[HeaderComponent] followLinks is false or unset, skipping routing to external url " + thisContextLink.path);
            }
          }
          if (thisContextLink.type==="internal") {
            // this is an internal router link
            this.onFollowedLink.emit("[router] " + thisContextLink.path);
            if (this.followLinks) {
              this.logger.log("[HeaderComponent] routing to internal route " + thisContextLink.path);
              this.headerService.routeToInternal(thisContextLink, this.router);
            } {
              this.logger.log("[HeaderComponent] followLinks is false or unset, skipping routing to external url " + thisContextLink.path);        
            }
          }   
        }
      }        
    } else {
      this.logger.log("[HeaderComponent] menuItem has no contextLinks: " + menuItem.id);
    }
  }

}
