export interface MenuItem {
  id: string;
  name?: string;
  path: string;
  fullPath?: string;
  extUrl?: string;
  icon?: string;
  menus?: MenuItem [];
  active?: boolean;
  hide?: boolean;
}
