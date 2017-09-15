import { Injectable } from '@angular/core';

@Injectable()
export class HeaderService {

  constructor() {}

  /*
  takes changes to data (current context, recent contexts, user, systemstate etc, stores it in localStorage, then gives it to component )
  also, this has a method to change/update second level menus.
  it should be possible to update data by talking to service OR changing the @Inputs on the header.
  */

}