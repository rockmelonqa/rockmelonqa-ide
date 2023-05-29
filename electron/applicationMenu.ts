// https://www.tutorialspoint.com/electron/electron_menus.htm
// https://github.com/electron/electron/blob/main/lib/browser/api/menu-item-roles.ts

import { BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions } from "electron";
import isDev from "electron-is-dev";
import application from "./IPC/application";
import window from "./IPC/window";

const template = [
  {
    role: "fileMenu",
    submenu: [
      {
        label: "New Project",
        accelerator: "CommandOrControl+N",
        click: async (menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
          if (browserWindow) {
            window.show(browserWindow, "dialog:NewProject");
          }
        },
      },
      {
        label: "Open Project",
        accelerator: "CommandOrControl+O",
        click: async (menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
          if (browserWindow) {
            application.openProject(browserWindow);
          }
        },
      },
      {
        label: "Close Project",
        visible: false,
        click: async (menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
          if (browserWindow) {
            application.closeProject(browserWindow);
          }
        },
      },
      {
        label: "Exit",
        accelerator: "CommandOrControl+Q",
        click: async (menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
          if (browserWindow) {
            application.quit(browserWindow);
          }
        },
      },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "About",
        click: async (menuItem: MenuItem, browserWindow: BrowserWindow | undefined) => {
          if (browserWindow) {
            window.show(browserWindow, "dialog:About");
          }
        },
      },
    ],
  },
] as Array<MenuItemConstructorOptions | MenuItem>;

if (isDev) {
  template.push({
    label: "Developer",
    submenu: [{ role: "reload" }, { role: "forceReload" }, { role: "toggleDevTools" }],
  });
}

const applicationMenu = Menu.buildFromTemplate(template);

export default applicationMenu;
