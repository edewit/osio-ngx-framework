import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Injectable } from '@angular/core';

import { User } from 'ngx-login-client';
import { Context, Space, ContextType } from 'ngx-fabric8-wit';
import { Logger } from 'ngx-base';

import { MenuItem } from './menu-item';
import { ContextLink } from './context-link';
import { SystemStatus } from './system-status';
import { MenuedContextType } from './menued-context-type';
import { Router } from "@angular/router/router";

@Injectable()
export class HeaderService {

  private KEY_CURRENT_CONTEXT: string = "CURRENT_CONTEXT";
  private KEY_RECENT_CONTEXTS: string = "RECENT_CONTEXTS";
  private KEY_USER: string = "USER";
  private KEY_SYSTEM_STATUS: string = "SYSTEM_STATUS";
  
  private currentContextSource: BehaviorSubject<Context>;
  private currentContextSource$: Observable<Context>;
  private recentContextsSource: BehaviorSubject<Context[]>;
  private recentContextsSource$: Observable<Context[]>;
  private userSource: BehaviorSubject<User>;
  private userSource$: Observable<User>;
  private systemStatusSource: BehaviorSubject<SystemStatus[]>;
  private systemStatusSource$: Observable<SystemStatus[]>;
  private activeMenuSource: BehaviorSubject<string>;
  private activeMenuSource$: Observable<string>;
  
  constructor(private logger: Logger) {
    this.logger.log("[HeaderService] initialized.");
  }

  /**
   * This updates a system status. If the given systemStatus is not 
   * already in the known status values (compared by id), it is 
   * added to the list.
   * @param systemStatus SystemStatus to be updated/added.
   */
  public updateSystemStatus(systemStatus: SystemStatus) {
    this.retrieveSystemStatus().first().subscribe(currentSystemStatus => {
      // returned systemStatus is never undefined, always at least empty array
      for (let i=0; i<currentSystemStatus.length; i++) {
        if (currentSystemStatus[i].id === systemStatus.id) {
          currentSystemStatus[i].name = systemStatus.name;
          currentSystemStatus[i].statusOk = systemStatus.statusOk;
          this.persistSystemStatus(currentSystemStatus);
          return;
        }        
      }
      // if not found, add it to the array
      currentSystemStatus.push(systemStatus);
      this.persistSystemStatus(currentSystemStatus);
    });
  }

  /**
   * This adds a new entry to the recent contexts.
   * @param context Context to be added to recentContexts.
   */
  public addRecentContext(context: Context) {
    this.retrieveRecentContexts().first().subscribe(recentContexts => {
      // returned recent contexts are never undefined, always at least empty array
      recentContexts.push(context);
      this.persistRecentContexts(recentContexts);
    });
  }

  /**
   * This stores the given data across web applications using localStorage.
   * Listeners subscribed to the matching @retrieveCurrentContext() are 
   * notified of the new stored value.
   * @param context data to be stored.
   */
  public persistCurrentContext(context: Context) {
    if (context) {
      this.persist(this.KEY_CURRENT_CONTEXT, context);      
      this.logger.log("[HeaderService] Stored currentContext");
    } else {
      this.clear(this.KEY_CURRENT_CONTEXT);
      this.logger.log("[HeaderService] Removed currentContext");
    }
    // notify subscribers
    if (!this.currentContextSource) {
      this.logger.log("[HeaderService] Creating new BehaviourSubject for currentContext");
      this.currentContextSource = new BehaviorSubject<Context>(context);
      this.currentContextSource$ = this.currentContextSource.asObservable();
    } 
    this.currentContextSource.next(context);
  }

  /**
   * This returns an Observable for the data. The latest value
   * will immediately being sent, so clients can expect the
   * current value. Initial value is undefined.
   */
  public retrieveCurrentContext(): Observable<Context> {
    let context: Context = this.retrieve(this.KEY_CURRENT_CONTEXT) as Context;
    if (!this.currentContextSource) {
      this.logger.log("[HeaderService] Creating new BehaviourSubject for currentContext");
      this.currentContextSource = new BehaviorSubject<Context>(context);
      this.currentContextSource$ = this.currentContextSource.asObservable();
    } else {
      this.currentContextSource.next(context);
    }
    this.logger.log("[HeaderService] Retrieved currentContext");
    return this.currentContextSource$;
  }

  /**
   * This stores the given data across web applications using localStorage.
   * Listeners subscribed to the matching @retrieveRecentContexts() are 
   * notified of the new stored value.
   * @param contexts data to be stored.
   */
  public persistRecentContexts(contexts: Context[]) {
    this.persist(this.KEY_RECENT_CONTEXTS, contexts);
    this.logger.log("[HeaderService] Stored recentContext");
    // notify subscribers
    if (!this.recentContextsSource) {
      this.logger.log("[HeaderService] Creating new BehaviourSubject for recentContexts");
      this.recentContextsSource = new BehaviorSubject<Context[]>(contexts);
      this.recentContextsSource$ = this.recentContextsSource.asObservable();
    } 
    this.recentContextsSource.next(contexts);
  }

  /**
   * This returns an Observable for the data. The latest value
   * will immediately being sent, so clients can expect the
   * current value. Initial value is empty array.
   */
  public retrieveRecentContexts(): Observable<Context[]> {
    let contexts: Context[] = this.retrieve(this.KEY_RECENT_CONTEXTS) as Context[];
    if (!this.recentContextsSource) {
      this.logger.log("[HeaderService] Creating new BehaviourSubject for recentContexts");
      this.recentContextsSource = new BehaviorSubject<Context[]>(contexts);
      this.recentContextsSource$ = this.recentContextsSource.asObservable();
      this.recentContextsSource.next([] as Context[]);
    } else {
      if (contexts)
        this.recentContextsSource.next(contexts);
      else
        this.recentContextsSource.next([]);      
    }
    this.logger.log("[HeaderService] Retrieved recentContexts");
    return this.recentContextsSource$;
  }

  /**
   * This stores the given data across web applications using localStorage.
   * Listeners subscribed to the matching @retrieveUser() are 
   * notified of the new stored value.
   * @param user data to be stored.
   */
  public persistUser(user: User) {
    if (user) {
      this.persist(this.KEY_USER, user);      
      this.logger.log("[HeaderService] Stored user");
    } else {
      this.clear(this.KEY_USER);
      this.logger.log("[HeaderService] Removed user");
    }
    // notify subscribers
    if (!this.userSource) {
      this.logger.log("[HeaderService] Creating new BehaviourSubject for user");
      this.userSource = new BehaviorSubject<User>(user);
      this.userSource$ = this.userSource.asObservable();
    }
    this.userSource.next(user);
  }

  /**
   * This returns an Observable for the data. The latest value
   * will immediately being sent, so clients can expect the
   * current value. Initial value is undefined.
   */
  public retrieveUser(): Observable<User> {
    let user: User = this.retrieve(this.KEY_USER) as User;
    if (!this.userSource) {
      this.logger.log("[HeaderService] Creating new BehaviourSubject for user");
      this.userSource = new BehaviorSubject<User>(user);
      this.userSource$ = this.userSource.asObservable();
    } else {
      this.userSource.next(user);
    }
    this.logger.log("[HeaderService] Retrieved user");
    return this.userSource$;
  }

  /**
   * 
   */
  public activateMenuItemById(menuId: string) {
    this.logger.log("[HeaderService] Activated MenuItem: " + menuId);
    // notify subscribers
    if (!this.activeMenuSource) {
      this.logger.log("[HeaderService] Creating new BehaviourSubject for activeMenuSource");
      this.activeMenuSource = new BehaviorSubject<string>(menuId);
      this.activeMenuSource$ = this.activeMenuSource.asObservable();
    }
    this.logger.log("[HeaderService] Sending out new activated MenuItem to subscribers");
    this.activeMenuSource.next(menuId);
  }

  /**
   * 
   */
  public menuItemActivations(): Observable<string> {
    let systemStatus = this.retrieve(this.KEY_SYSTEM_STATUS) as SystemStatus[];
    if (!this.activeMenuSource) {
      this.logger.log("[HeaderService] Creating new BehaviourSubject for activeMenuSource");
      this.activeMenuSource = new BehaviorSubject<string>(null);
      this.activeMenuSource$ = this.activeMenuSource.asObservable();
    } 
    this.logger.log("[HeaderService] Subscribed to menuItem activations");
    return this.activeMenuSource$;
  }

  /**
   * This stores the given data across web applications using localStorage.
   * Listeners subscribed to the matching @retrieveSystemStatus() are 
   * notified of the new stored value.
   * @param systemStatus data to be stored.
   */
  public persistSystemStatus(systemStatus: SystemStatus[]) {
    this.logger.log("[HeaderService] Stored systemStatus");
    this.persist(this.KEY_SYSTEM_STATUS, systemStatus);    
    // notify subscribers
    if (!this.systemStatusSource) {
      this.logger.log("[HeaderService] Creating new BehaviourSubject for systemStatus");
      this.systemStatusSource = new BehaviorSubject<SystemStatus[]>(systemStatus);
      this.systemStatusSource$ = this.systemStatusSource.asObservable();
    }
    this.logger.log("[HeaderService] Sending out new systemStatus to subscribers");
    this.systemStatusSource.next(systemStatus);
  }

  /**
   * This returns an Observable for the data. The latest value
   * will immediately being sent, so clients can expect the
   * current value. Initial value is empty array.
   */
  public retrieveSystemStatus(): Observable<SystemStatus[]> {
    let systemStatus = this.retrieve(this.KEY_SYSTEM_STATUS) as SystemStatus[];
    if (!this.systemStatusSource) {
      this.logger.log("[HeaderService] Creating new BehaviourSubject for systemStatus");
      this.systemStatusSource = new BehaviorSubject<SystemStatus[]>(systemStatus);
      this.systemStatusSource$ = this.systemStatusSource.asObservable();
      this.systemStatusSource.next([] as SystemStatus[]);
    } else {
      if (systemStatus)
      this.systemStatusSource.next(systemStatus);
      else
        this.systemStatusSource.next([]);      
    }
    this.logger.log("[HeaderService] Retrieved systemStatus");
    return this.systemStatusSource$;
  }

  /**
   * Initialzes persistent storage with default values.
   */
  public init() {
    this.clean();
    this.logger.log("[HeaderService] Initialized storage.");
  }

  /**
   * This cleans the persistent storage in the browser's local storage.
   * Subscribed clients will be notified.
   */
  public clean() {
    this.persistUser(undefined);
    this.persistCurrentContext(undefined);
    this.persistRecentContexts(undefined);
    this.persistSystemStatus(undefined);
    this.logger.log("[HeaderService] Cleared storage.");
  }

  /**
   * This replaces/adds a submenu to a main menu entry. It relies
   * that menus have unique id attributes.
   * @param menuId the id of the main menu entry that should be associated with the new submenu.
   * @param newMenu the new submenu.
   */
  public replaceSubMenu(menuId: string, newMenu: MenuItem[]) {
    // get the latest currentContext value
    this.logger.log("[HeaderService] Replacing submenus for menu id " + menuId);
    let context: Context = this.currentContextSource.getValue();
    if (context) {
      let contextType: MenuedContextType = context.type as MenuedContextType;
      for (let i=0; i<contextType.menus.length; i++) {
        if (contextType.menus[i].id===menuId) {
          this.logger.log("[HeaderService] Found and replaced submenus for menu id " + menuId);
          // found the matching menu, replace the submenu
          contextType.menus[i].menus = newMenu;
          // and store, notify subscribers
          this.persistCurrentContext(context);
        }
      }
    } else {
      this.logger.log("[HeaderService] Current context has no menus or is empty, no submenu replaced.");      
    }
  }

  /**
   * This routes to an internal path based on the given ContextLink.
   * @param contextLink ContextLink that carries the path to navigated to.
   * @param router Router for navigating.
   */
  public routeToInternal(contextLink: ContextLink, router: Router) {
    this.logger.log("[HeaderService] Routing to internal route path: " + contextLink.path);      
    router.navigate([contextLink.path]);
  }

  /**
   * This navigates to an external url based on the given ContextLink.
   * @param contextLink ContextLink that carries the path to navigated to.
   * @param window Window instance to be used for navigating.
   */
  public routeToExternal(contextLink: ContextLink, window: Window) {
    this.logger.log("[HeaderService] Routing to external route path: " + contextLink.path);      
    window.location.href = contextLink.path;
  }

  /**
   * This creates a context from a given Space and User. This effectively
   * pre-configures the menu system and the available menuitems. This method
   * should be configurable or externalized at some point to make the menu
   * configuration not hardcoded. It should be replaced by some kind of
   * registry for OSIO components, where external apps can register and
   * being added to a dynamic menu structure.
   * @param space Space for the new Context.
   * @param user User for the new Context.
   */
  public createContext(name: string, path: string, space: Space, user: User): Context {
    return {
      user: user,
      space: space,
      type: { 
        name: 'space',
        icon: 'fa fa-heart',
        menus: [
          {
            id: 'analyze',
            name: 'Analyze',
            icon: '',
            active: true,
            contextLinks: [
              {
                context: 'platform',
                type: 'internal',
                path: '/analyze'
              } as ContextLink,
              {
                context: 'planner',
                type: 'external',
                path: 'http://ext.menuEntry0.someContext1/'
              } as ContextLink
            ] as ContextLink[],
            menus: [ ] as MenuItem[]
          } as MenuItem,
          {
            id: 'planner',
            name: 'Planner',
            icon: '',
            contextLinks: [
              {
                context: 'planner',
                type: 'internal',
                path: '/planner/list'
              } as ContextLink,
              {
                context: 'platform',
                type: 'external',
                path: 'http://ext.menuEntry1.someContext1/'
              } as ContextLink
            ] as ContextLink[],
            menus: [
              {
                id: 'planner_list',
                name: 'Backlog',
                icon: 'fa fa-heart',
                contextLinks: [
                  {
                    context: 'planner',
                    type: 'internal',
                    path: '/plan/list'
                  } as ContextLink,
                  {
                    context: 'platform',
                    type: 'external',
                    path: 'http://ext.menuEntry1_1.someContext1/'
                  } as ContextLink
                ] as ContextLink[]
              } as MenuItem,
              {
                id: 'planner_board',
                name: 'Board',
                icon: 'fa fa-heart',
                contextLinks: [
                  {
                    context: 'planner',
                    type: 'internal',
                    path: '/plan/board'
                  } as ContextLink,
                  {
                    context: 'platform',
                    type: 'external',
                    path: 'http://ext.menuEntry1_2.someContext1/'
                  } as ContextLink
                ] as ContextLink[]
              } as MenuItem,
            ] as MenuItem[]
          } as MenuItem,
          {
            id: 'create',
            name: 'Create',
            icon: '',
            contextLinks: [
              {
                context: 'platform',
                type: 'internal',
                path: '/create'
              } as ContextLink,
              {
                context: 'planner',
                type: 'external',
                path: 'http://ext.menuEntry2.someContext1/'
              } as ContextLink
            ] as ContextLink[]
          } as MenuItem,
        ] as MenuItem[]
      } as ContextType,
      path: path,
      name: name
    } as Context;
  }

  // stores a given data in the localStorage. This is domain/port/protocol
  // specific, but as OSIO is always using the same domain/port/protocol, this
  // works. We do not do encryption or obfuscation for now, there is no attack
  // vector, all data stored here can also be read from the running Angular
  // application. We also do not prefix keys as we are only using localStorage
  // from this service.
  // Note that this is only working on non-cyclic data structures that can be
  // serialized using JSON.stringify().
  private persist(key: string, data: any) {
    let text = JSON.stringify(data);
    this.logger.log("[HeaderService] storing key " + key + " with value " + text);
    localStorage.setItem(key, text);
  }

  // retrieves de-serialized data from localStorage.
  private retrieve(key: string): any {
    let text = localStorage.getItem(key);
    this.logger.log("[HeaderService] retrieved key " + key + " with value " + text);
    try {
      return JSON.parse(text);            
    } catch (e) {
      this.logger.log("[HeaderService] retrieved key " + key + " has invalid value " + text);
      return null;
    }
  }

  private clear(key: string) {
    localStorage.removeItem(key);
    this.logger.log("[HeaderService] removed key " + key);
  }
}