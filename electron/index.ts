import * as dotenv from "dotenv";
import { app, ipcMain } from "electron";
import globals from "./globals";
import Main from "./mainWindow";

import application from "./IPC/application";
import fileSystem from "./IPC/fileSystem";
import window from "./IPC/window";

import { pathToFileURL } from "node:url";
import path from "path";
import autoUpdater from "./IPC/autoUpdater";
import codeGenearator from "./IPC/codeGenerator";
import testRunner from "./IPC/testRunner";

const config = dotenv.config().parsed;

let developerOptions = {
  isInProduction: true,
  serveSvelteDev: false,
  watchSvelteBuild: false,
};

if (config) {
  const BOOLEAN_TRUE = "true";
  developerOptions = {
    ...developerOptions,
    isInProduction: config.IS_IN_PRODUCTION ? config.IS_IN_PRODUCTION === BOOLEAN_TRUE : true,
    serveSvelteDev: config.SERVE_SVELTE_DEV === BOOLEAN_TRUE,
    watchSvelteBuild: config.WATCH_SVELTE_BUILD === BOOLEAN_TRUE,
  };
}

const mainURLPATH = pathToFileURL(path.join(__dirname, "www", "index.html"));

globals.set.mainURL(mainURLPATH.href);
globals.set.preloadjs(path.join(__dirname, "preload.js"));

app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendArgument("disable-gpu");
app.commandLine.appendSwitch("enable-experimental-web-platform-features");

const windowSettings = {
  title: "Rockmelon QA",
  // width: 854,
  // height: 854,
};

let main = new Main(windowSettings, developerOptions);

main.onEvent.on("window-created", async () => {
  autoUpdater.initIpcMain(ipcMain, main.window);
  autoUpdater.initAutoUpdater(main.window);

  application.initIpcMain(ipcMain, main.window);
  codeGenearator.initIpcMain(ipcMain, main.window);
  testRunner.initIpcMain(ipcMain, main.window);
  fileSystem.initIpcMain(ipcMain, main.window);
  window.initIpcMain(ipcMain, main.window);
});
