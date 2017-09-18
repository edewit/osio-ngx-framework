import { Subscription, Observable } from 'rxjs';

import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { Logger } from 'ngx-base';
import { UserService, User } from 'ngx-login-client';
import { ContextType, Context } from 'ngx-fabric8-wit';

import { HeaderService } from "./header.service";
import { MenuItem } from './menu-item';
import { MenuedContextType } from './menued-context-type';
import { SystemStatus } from "./system-status";

/*
interface MenuHiddenCallback {
  (headerComponent: HeaderComponent): Observable<boolean>;
}
*/

/*
 * This is a re-usable header component that is able to persist the state
 * of all involved data on page reloads (or application switches on the same
 * domain). It uses localStorage for this. Goals were:
 *  - make the component as non-semantic as possible given the existing data structure.
 *  - make the component rely on event behaviour of enclosing components.
 *  - make the storage of the data as transaprent as possible for enclosing components.
 * The overall goal is to create a component that works like any other Angular
 * component but across application boundaries - it should preserve it's data on
 * application switches as it would be doing it in a single SPA.
 * 
 * Values in the attributes at init time are getting ignored when there are values
 * stored in localStorage. Or in other words: values in localStorage always take 
 * precedence over local attribute values to the component. If you need to update the
 * values, use either the attributes or the headerService. Both ways work either way,
 * always storing changes in localStorage immediately.
 */
@Component({
  selector: 'osio-app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less'],
  providers: []
})
export class HeaderComponent implements OnChanges, OnInit { // implements OnInit, OnDestroy {

  // if this is set to true, the component will not automatically
  // follow MenuItem.fullPath or MenuItem.extUrl links. The event
  // is emitted in both cases, so if this is set to true, the 
  // enclosing component has to do the routing based on that events.
  @Input("noFollowLinks")
  private noFollowLinks: Boolean;
  
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

  // this prevents changes to the @Input values until the service is being started
  private changesEnabled = false;

  constructor(
    private router: Router,
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
        this.headerService.persistSystemState(this.systemStatus);      
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
      if (value) {
        this.logger.log("[HeaderComponent] set service change to currentContext.");
        this.setCurrentContext(value)
      } else {
        this.logger.log("[HeaderComponent] service change to currentContext are nil, not setting them.");        
        this.headerService.persistCurrentContext(this.currentContext);
      }
    });
    this.headerService.retrieveRecentContexts().subscribe(value => {
      this.logger.log("[HeaderComponent] incoming service change to recentContexts: " + JSON.stringify(value));
      if (value) {
        this.logger.log("[HeaderComponent] set service change to recentContexts.");
        this.recentContexts = value
      } else {
        this.logger.log("[HeaderComponent] service change to recentContexts are nil, not setting them.");        
        this.headerService.persistRecentContexts(this.recentContexts);
      }
    });
    this.headerService.retrieveSystemState().subscribe(value => {
      this.logger.log("[HeaderComponent] incoming service change to systemState: " + JSON.stringify(value));
      if (value) {
        this.logger.log("[HeaderComponent] set service change to systemState.");
        this.systemStatus = value
      } else {
        this.logger.log("[HeaderComponent] service change to systemState are nil, not setting them.");        
        this.headerService.persistSystemState(this.systemStatus);
      }
    });
    this.headerService.retrieveUser().subscribe(value => {
      this.logger.log("[HeaderComponent] incoming service change to user: " + JSON.stringify(value));
      if (value) {
        this.logger.log("[HeaderComponent] set service change to user.");
        this.user = value
      } else {
        this.logger.log("[HeaderComponent] service change to user are nil, not setting them.");
        this.headerService.persistUser(this.user);
      }
    });
    // we now allow changes to be propagated. We need this because the localStorage values
    // should have precedence while still being able to detect changes to the @Input attributes.
    // TODO: persist everything
    this.changesEnabled = true;
  }

  // sets a new context; will also be called from
  // ngOnChanges when the current context changes
  // to update the menus
  private setCurrentContext(context: Context) {
    this.logger.log("[HeaderComponent] set current context to " + context.name);
    // store the new context
    this.currentContext = context;
    // update the active menu, set to non-active
    if (this.activeTopLevelMenu) {
      this.activeTopLevelMenu.active = false;
    }
    // set the new context menu
    let menus = (this.currentContext.type as MenuedContextType).menus;
    this.activeTopLevelMenu = menus[0];
    this.activeTopLevelMenu.active = true;
  }

  // toggle navbar collapse
  private toggleState() { 
      this.isNavbarVisible = this.isNavbarVisible === false ? true : false;
  }
  
  private selectRecentContext(context: Context) {
    // making this automatic routing the user to
    // the context.path would require adding an
    // alternative way for extUrls here. This would mean
    // breaking the model (we would need another field in
    // Context, which is not easily possible from this
    // module). Therefore, we only emit the event and
    // let the enclosing component route the user. 
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
    this.onSelectMenuItem.emit(menuItem);
    if (this.activeTopLevelMenu) {
      this.activeTopLevelMenu.active = false;
    }
    menuItem.active = true;
    this.activeTopLevelMenu = menuItem;
  }

  private secondaryMenuSelect(menuItem: MenuItem) {
    this.goTo(menuItem);
    // [routerLink]="[n.fullPath]" [queryParams]="plannerFollowQueryParams"
    this.logger.log("[HeaderComponent] selected submenu: " + menuItem.name);
    this.onSelectMenuItem.emit(menuItem);
  }

  private about() {
    this.logger.log("[HeaderComponent] selected 'about'");
    this.onSelectAbout.emit();
  }

  // this executes the link, based on what link type the menuItem is of.
  // external resources have the extUrl attribute set to an url. The
  // extUrl attribute takes precedence over the router link in fullPath.
  // If neither is set, there is only the event from the menu click emitted.
  private goTo(menuItem: MenuItem) {
    if (menuItem.extUrl) {
      // this is an external URL
      this.onFollowedLink.emit("[external] " + menuItem.extUrl);
      // TODO: store all data to localStorage
      if (!this.noFollowLinks) {
        this.logger.log("[HeaderComponent] routing to external url " + menuItem.extUrl);
        window.location.href = menuItem.fullPath;
      } else {
        this.logger.log("[HeaderComponent] noFollowLinks is true, skipping routing to external url " + menuItem.extUrl);
      }
    }
    if (menuItem.fullPath) {
      // this is an internal router link
      this.onFollowedLink.emit("[router] " + menuItem.fullPath);
      if (!this.noFollowLinks) {
        this.logger.log("[HeaderComponent] routing to internal route " + menuItem.fullPath);
        this.router.navigate([menuItem.fullPath]);
      } {
        this.logger.log("[HeaderComponent] noFollowLinks is true, skipping routing to external url " + menuItem.extUrl);        
      }
    }
  }

  /*
  recent: Context[];
  private _context: Context;
  private _defaultContext: Context;

  title = 'Almighty';
  imgLoaded: Boolean = false;
  statusListVisible = false;

  onStatusListVisible = (flag: boolean) => {
    this.statusListVisible = flag;
  };

  menuCallbacks = new Map<String, MenuHiddenCallback>([
    [
      '_settings', function (headerComponent) {
        return headerComponent.checkContextUserEqualsLoggedInUser();
      }
    ],
    [
      '_resources', function (headerComponent) {
        return headerComponent.checkContextUserEqualsLoggedInUser();
      }
    ],
    [
      'settings', function (headerComponent) {
        return headerComponent.checkContextUserEqualsLoggedInUser();
      }
    ]
  ]);

  private _loggedInUserSubscription: Subscription;
  private plannerFollowQueryParams: Object = {};
  private eventListeners: any[] = [];

  constructor(
    public router: Router,
    public route: ActivatedRoute,
    private userService: UserService,
    private logger: Logger,
    public loginService: LoginService,
    private broadcaster: Broadcaster,
    private contexts: Contexts
  ) {
    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.broadcaster.broadcast('navigate', { url: val.url } as Navigation);
        this.updateMenus();
      }
    });
    contexts.current.subscribe(val => {
      this._context = val;
      this.updateMenus();
    });
    contexts.default.subscribe(val => {
      this._defaultContext = val;
    })
    contexts.recent.subscribe(val => this.recent = val);

    // Currently logged in user
    this.userService.loggedInUser.subscribe(
      val => {
        if (val.id) {
          this.loggedInUser = val;
        } else {
          this.resetData();
          this.loggedInUser = null;
        }
      }
    );
  }

  ngOnInit(): void {
    this.listenToEvents();
  }

  ngOnDestroy() {
    this.eventListeners.forEach(e => e.unsubscribe());
  }


  listenToEvents() {
    this.eventListeners.push(
      this.route.queryParams.subscribe(params => {
        this.plannerFollowQueryParams = {};
        if (Object.keys(params).indexOf('iteration') > -1) {
          this.plannerFollowQueryParams['iteration'] = params['iteration'];
        }
      })
    );
  }

  login() {
    this.broadcaster.broadcast('login');
    this.loginService.redirectToAuth();
  }

  logout() {
    this.loginService.logout();

  }

  onImgLoad() {
    this.imgLoaded = true;
  }

  resetData(): void {
    this.imgLoaded = false;
  }

  get context(): Context {
    if (this.router.url === '/_home') {
      return this._defaultContext;
    } else {
      return this._context;
    }
  }

  private updateMenus() {
    if (this.context && this.context.type && this.context.type.hasOwnProperty('menus')) {
      let foundPath = false;
      let menus = (this.context.type as MenuedContextType).menus;
      for (let n of menus) {
        // Clear the menu's active state
        n.active = false;
        if (this.menuCallbacks.has(n.path)) {
          this.menuCallbacks.get(n.path)(this).subscribe(val => n.hide = val);
        }
        // lets go in reverse order to avoid matching
        // /namespace/space/create instead of /namespace/space/create/pipelines
        // as the 'Create' page matches to the 'Codebases' page
        let subMenus = (n.menus || []).slice().reverse();
        if (subMenus) {
          for (let o of subMenus) {
            // Clear the menu's active state
            o.active = false;
            if (!foundPath && o.fullPath === decodeURIComponent(this.router.url)) {
              foundPath = true;
              o.active = true;
              n.active = true;
            }
            if (this.menuCallbacks.has(o.path)) {
              this.menuCallbacks.get(o.path)(this).subscribe(val => o.hide = val);
            }
          }
          if (!foundPath) {
            // lets check if the URL matches part of the path
            for (let o of subMenus) {
              if (!foundPath && decodeURIComponent(this.router.url).startsWith(o.fullPath + "/")) {
                foundPath = true;
                o.active = true;
                n.active = true;
              }
              if (this.menuCallbacks.has(o.path)) {
                this.menuCallbacks.get(o.path)(this).subscribe(val => o.hide = val);
              }
            }
          }
          if (!foundPath && this.router.routerState.snapshot.root.firstChild) {
            // routes that can't be correctly matched based on the url should use the parent path
            for (let o of subMenus) {
              let parentPath = decodeURIComponent('/' + this.router.routerState.snapshot.root.firstChild.url.join('/'));
              if (!foundPath && o.fullPath === parentPath) {
                foundPath = true;
                o.active = true;
                n.active = true;
              }
              if (this.menuCallbacks.has(o.path)) {
                this.menuCallbacks.get(o.path)(this).subscribe(val => o.hide = val);
              }
            }
          }
        } else if (!foundPath && n.fullPath === this.router.url) {
          n.active = true;
          foundPath = true;
        }
      }
    }
  }

  private checkContextUserEqualsLoggedInUser(): Observable<boolean> {
    return Observable.combineLatest(
      Observable.of(this.context).map(val => val.user.id),
      this.userService.loggedInUser.map(val => val.id),
      (a, b) => (a !== b)
    );
  }
  */
}
