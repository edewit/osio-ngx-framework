import { ContextLink } from './context-link';

export interface MenuItem {
  id: string;
  name?: string;
  path: string;
  contextLinks?: ContextLink[]; 
  icon?: string;
  menus?: MenuItem [];
  active?: boolean;
  hide?: boolean;
}
