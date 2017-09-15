import { ContextType } from 'ngx-fabric8-wit';

import { MenuItem } from './menu-item';

export class MenuedContextType implements ContextType {
  name: string;
  icon: string;
  menus: MenuItem[];
}
