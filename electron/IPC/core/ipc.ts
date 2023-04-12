// Reference: https://github.com/el3um4s/ipc-for-electron/blob/main/src/IPC/IPC.ts

import { BrowserView, BrowserWindow, IpcMain } from "electron";
import { APIChannels, IChannels } from "./channelsInterface";

export default class IPC {
  nameAPI = "api";
  validSendChannel: IChannels = {};
  validInvokeChannel: IChannels = {};
  validReceiveChannel: string[] = [];

  constructor(channels: APIChannels) {
    this.nameAPI = channels.nameAPI;
    this.validSendChannel = channels.validSendChannel;
    this.validInvokeChannel = channels.validInvokeChannel;
    this.validReceiveChannel = channels.validReceiveChannel;
  }

  get channels(): APIChannels {
    return {
      nameAPI: this.nameAPI,
      validSendChannel: this.validSendChannel,
      validInvokeChannel: this.validInvokeChannel,
      validReceiveChannel: this.validReceiveChannel,
    };
  }

  async initIpcMain(ipcMain: IpcMain, customWindow: BrowserWindow | BrowserView) {
    if (customWindow) {
      Object.keys(this.validSendChannel).forEach((key) => {
        ipcMain.on(key, async (event, message) => {
          try {
            if (!!customWindow && customWindow.webContents.id === event.sender.id) {
              await this.validSendChannel[key](customWindow, event, message);
            }
          } catch (e) {
            if (e instanceof TypeError) {
              // console.log(e.name, e.message);
            } else {
              // console.log(e);
            }
          }
        });
      });

      Object.keys(this.validInvokeChannel).forEach((key) => {
        ipcMain.handle(key, async (event, message) => {
          try {
            if (!!customWindow && customWindow.webContents.id === event.sender.id) {
              return await this.validInvokeChannel[key](customWindow, event, message);
            }
          } catch (e) {
            if (e instanceof TypeError) {
              // console.log(e.name, e.message);
            } else {
              // console.log(e);
            }
          }
        });
      });
    }
  }
}
