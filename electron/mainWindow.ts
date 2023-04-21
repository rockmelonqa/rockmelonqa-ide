import { app, BrowserWindow, Menu } from "electron";
import EventEmitter from "events";
import path from "path";
import applicationMenu from "./applicationMenu";
import ConfigureDev, { DeveloperOptions } from "./configureDev";

import { isWindowMaximize, setWindowMaximize, setWindowMinimize } from './utils/electronStore';
const appName = "Rockmelon QA";
const localHost = "http://localhost:7011";

const defaultSettings = {
  title: "Rockmelon QA",
  width: 854,
  height: 480,
};

const defaultSettingsDev: DeveloperOptions = {
  isInProduction: true, // true if is in production
  serveSvelteDev: false, // true when you want to watch svelte
  watchSvelteBuild: false, // true when you want to watch build svelte
};

class Main {
  window!: BrowserWindow;
  settings: { [key: string]: any };
  onEvent: EventEmitter = new EventEmitter();
  settingsDev: DeveloperOptions;
  configDev: ConfigureDev;

  constructor(settings: { [key: string]: any } | null = null, settingsDev: DeveloperOptions | null = null) {
    this.settings = settings ? { ...settings } : { ...defaultSettings };
    this.settingsDev = settingsDev ? { ...settingsDev } : { ...defaultSettingsDev };

    this.configDev = new ConfigureDev(this.settingsDev);

    app.on("ready", async () => {
      let loading = new BrowserWindow({
        show: false,
        frame: false,
        width: 300,
        height: 300,
        transparent: true,
        icon: path.join(__dirname, "www", "favicon.png"),
      });

      loading.once("show", async () => {
        this.window = await this.createWindow();
        this.onEvent.emit("window-created");
        loading.hide();
        loading.close();
      });
      loading.loadURL(
        this.configDev.isLocalHost() ? `${localHost}/loading.html` : path.join(__dirname, "www", "loading.html")
      );
      loading.show();
    });

    app.on("window-all-closed", this.onWindowAllClosed);
    app.on("activate", this.onActivate);
  }

  async createWindow() {
    Menu.setApplicationMenu(applicationMenu);

    let settings = { ...this.settings };
    app.name = appName;
    let window = new BrowserWindow({
      ...settings,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        preload: path.join(__dirname, "preload.js"),
      },
      icon: path.join(__dirname, "www", "favicon.png"),
    });

    if (this.configDev.isLocalHost()) {
      try {
        await window.loadURL(`${localHost}`);
      } catch (error) {
        console.log(`ERROR: window.loadURL("${localHost}");`);
        console.error(error);
      }
    } else if (this.configDev.isElectronServe()) {
      try {
        await this.configDev.loadURL(window);
      } catch (error) {
        console.log(`ERROR: this.configDev.loadURL(window);`);
        console.error(error);
      }
    }

    if(isWindowMaximize()) {
      window.maximize();
    } else {
      window.minimize();
    }

    window.on('maximize', () => {
      setWindowMaximize();
    });

    window.on('minimize', () => {
      setWindowMinimize();
    });

    window.show();

    return window;
  }

  onWindowAllClosed() {
    if (process.platform !== "darwin") {
      app.quit();
    }
  }

  onActivate() {
    if (!this.window) {
      this.createWindow();
    }
  }
}

export default Main;
