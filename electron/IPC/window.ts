import { BrowserWindow } from "electron";
import { IChannels } from "./core/channelsInterface";
import IPC from "./core/ipc";

const nameAPI = "window";

// to Main
const validSendChannel: IChannels = {};

const validInvokeChannel: IChannels = {};

// from Main
const validReceiveChannel: string[] = ["show"];

class WindowIPC extends IPC {
  show(browserWindow: BrowserWindow, data: any) {
    show(browserWindow, data);
  }
}

const window = new WindowIPC({
  nameAPI,
  validSendChannel,
  validInvokeChannel,
  validReceiveChannel,
});

/*
 * Window IPC:
 * - Show/hide window
 * - Show/hide dialog
 * - ...
 */
export default window;

/*
 * Ask renderer to show a particular window, dialog...
 */
function show(browserWindow: BrowserWindow, data: any) {
  browserWindow.webContents.send("show", data);
}
