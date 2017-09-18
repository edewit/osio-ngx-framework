import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Injectable } from '@angular/core';

import { User } from 'ngx-login-client';
import { Context } from 'ngx-fabric8-wit';
import { Logger } from 'ngx-base';

import { MenuItem } from './menu-item';
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
  
  constructor(private logger: Logger) {
    this.logger.log("[HeaderService] initialized.");
  }

  /**
   * This stores the given data across web applications using localStorage.
   * Listeners subscribed to the matching @retrieveCurrentContext() are 
   * notified of the new stored value.
   * @param context data to be stored.
   */
  public persistCurrentContext(context: Context) {
    this.logger.log("[HeaderService] Stored currentContext");
    this.persist(this.KEY_CURRENT_CONTEXT, context);
    // notify subscribers
    this.retrieveCurrentContext();        
  }

  /**
   * This returns an Observable for the data. The latest value
   * will immediately being sent, so clients can expect the
   * current value.
   */
  public retrieveCurrentContext(): Observable<Context> {
    this.logger.log("[HeaderService] Retrieved currentContext");
    let context: Context = this.retrieve(this.KEY_CURRENT_CONTEXT) as Context;
    if (!this.currentContextSource) {
      this.currentContextSource = new BehaviorSubject<Context>(context);
      this.currentContextSource$ = this.currentContextSource.asObservable();
    } else {
      this.currentContextSource.next(context);
    }
    return this.currentContextSource$;
  }

  /**
   * This stores the given data across web applications using localStorage.
   * Listeners subscribed to the matching @retrieveRecentContexts() are 
   * notified of the new stored value.
   * @param contexts data to be stored.
   */
  public persistRecentContexts(contexts: Context[]) {
    this.logger.log("[HeaderService] Stored recentContext");
    this.persist(this.KEY_RECENT_CONTEXTS, contexts);
    // notify subscribers
    this.retrieveRecentContexts();        
  }

  /**
   * This returns an Observable for the data. The latest value
   * will immediately being sent, so clients can expect the
   * current value.
   */
  public retrieveRecentContexts(): Observable<Context[]> {
    this.logger.log("[HeaderService] Retrieved recentContexts");
    let contexts: Context[] = this.retrieve(this.KEY_RECENT_CONTEXTS) as Context[];
    if (!this.recentContextsSource) {
      this.recentContextsSource = new BehaviorSubject<Context[]>(contexts);
      this.recentContextsSource$ = this.recentContextsSource.asObservable();
    } else {
      this.recentContextsSource.next(contexts);
    }
    return this.recentContextsSource$;
  }

  /**
   * This stores the given data across web applications using localStorage.
   * Listeners subscribed to the matching @retrieveUser() are 
   * notified of the new stored value.
   * @param user data to be stored.
   */
  public persistUser(user: User) {
    this.logger.log("[HeaderService] Stored user");
    this.persist(this.KEY_USER, user);
    // notify subscribers
    this.retrieveUser();
  }

  /**
   * This returns an Observable for the data. The latest value
   * will immediately being sent, so clients can expect the
   * current value.
   */
  public retrieveUser(): Observable<User> {
    this.logger.log("[HeaderService] Retrieved user");
    let user: User = this.retrieve(this.KEY_USER) as User;
    if (!this.userSource) {
      this.userSource = new BehaviorSubject<User>(user);
      this.userSource$ = this.userSource.asObservable();
    } else {
      this.userSource.next(user);
    }
    return this.userSource$;
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
    this.retrieveSystemStatus();
  }

  /**
   * This returns an Observable for the data. The latest value
   * will immediately being sent, so clients can expect the
   * current value.
   */
  public retrieveSystemStatus(): Observable<SystemStatus[]> {
    this.logger.log("[HeaderService] Retrieved systemStatus");
    let systemStatus = this.retrieve(this.KEY_SYSTEM_STATUS) as SystemStatus[];
    if (!this.systemStatusSource) {
      this.logger.log("[HeaderService] Creating new BehaviourSubject for systemStatus");
      this.systemStatusSource = new BehaviorSubject<SystemStatus[]>(systemStatus);
      this.systemStatusSource$ = this.systemStatusSource.asObservable();
    } else {
      this.logger.log("[HeaderService] Sending out new systemStatus to subscribers");
      this.systemStatusSource.next(systemStatus);
    }
    return this.systemStatusSource$;
  }

  /**
   * This cleas the persistent storage in the browser's local storage.
   * Subscribed clients will not be notified.
   */
  public clear() {
    localStorage.clear();
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
   * This routes to an internal path based on the given MenuItem.
   * @param menuItem MenuItem that carries the fullPath to navigated to.
   * @param router Router for navigating.
   */
  public routeToInternal(menuItem: MenuItem, router: Router) {
    this.logger.log("[HeaderService] Routing to internal route path: " + menuItem.fullPath);      
    router.navigate([menuItem.fullPath]);
  }

  /**
   * This navigates to an external url based on the given MenuItem.
   * @param menuItem MenuItem that carries the fullPath to navigated to.
   * @param window Window instance to be used for navigating.
   */
  public routeToExternal(menuItem: MenuItem, window: Window) {
    this.logger.log("[HeaderService] Routing to external route path: " + menuItem.fullPath);      
    window.location.href = menuItem.fullPath;
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
}