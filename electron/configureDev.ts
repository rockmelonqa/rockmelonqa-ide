import serve from "electron-serve";
import path from "path";

export interface DeveloperOptions {
  /** Set to true if this is production */
  isInProduction: boolean;

  /** Set to true if you are running the sveltekit dev server. Will reload electron app when files change. */
  serveSvelteDev: boolean;

  /** Set to true if you are running the sveltekit build. Will reload electron app when files change. */
  watchSvelteBuild: boolean;
}

class ConfigureDev {
  isInProduction: boolean;
  serveSvelteDev: boolean;
  watchSvelteBuild: boolean;
  loadURL: any;

  constructor(settings: DeveloperOptions) {
    this.isInProduction = settings.isInProduction;
    this.serveSvelteDev = settings.serveSvelteDev;
    this.watchSvelteBuild = settings.watchSvelteBuild;
    this.loadURL = null;

    this._check_isInProduction();

    if (!this.isInProduction && this.serveSvelteDev) this._dev_Svelte();
    if (!this.isInProduction && this.watchSvelteBuild) this._watch_Dist();
    if (this.isInProduction || !this.serveSvelteDev) this._serve_Dist();
  }

  _check_isInProduction() {
    if (!this.isInProduction) {
      this.isInProduction = process.env.NODE_ENV === "production" || !/[\\/]electron/.exec(process.execPath); // !process.execPath.match(/[\\/]electron/);
    }
  }
  _dev_Svelte() {
    require("electron-reload")(path.join(__dirname, "..", "svelte"));
  }
  _watch_Dist() {
    require("electron-reload")(path.join(__dirname, "www"));
  }
  _serve_Dist() {
    this.loadURL = serve({ directory: "dist/www" });
  }

  isLocalHost() {
    return this.serveSvelteDev;
  }
  isElectronServe() {
    return !this.serveSvelteDev;
  }
}

export default ConfigureDev;
