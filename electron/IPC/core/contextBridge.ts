// Reference: https://github.com/el3um4s/ipc-for-electron/blob/main/src/IPC/contextBridge.ts
// https://github.com/electron-react-boilerplate/electron-react-boilerplate/blob/main/src/main/preload.ts

import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { Action } from "rockmelonqa.common";
import { APIChannels, IChannels } from "./channelsInterface";
import IPC from "./ipc";

interface APIContextBridge {
  send: (channel: string, data: any) => void;
  invoke: (channel: string, data: any) => Promise<any | void>;
  /**
   * Return nothing (undefined) or a function to cleanup listener
   */
  on: (channel: string, func: Action) => Action | undefined;
  once: (channel: string, func: Action) => void;
}

export default function generateContextBridge(listIPC: IPC[], apiKey = "ipc") {
  const listChannels: APIChannels[] = [];
  listIPC.forEach((el) => {
    listChannels.push(el.channels);
  });

  const listAPI: { [key: string]: APIContextBridge } = {};

  listChannels.forEach((el) => {
    const api = getContextBridge(el);
    const name = el.nameAPI;
    listAPI[name] = { ...api };
  });

  contextBridge.exposeInMainWorld(apiKey, {
    ...listAPI,
  });
}

function getContextBridge(obj: APIChannels): APIContextBridge {
  const validSendChannel = getArrayOfValidChannel(obj.validSendChannel);
  const validInvokeChannel = getArrayOfValidChannel(obj.validInvokeChannel);
  const { validReceiveChannel } = { ...obj };

  return {
    send: (channel: string, data: any) => {
      // whitelist channels
      if (validSendChannel.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    invoke: async (channel: string, data: any): Promise<any | void> => {
      // whitelist channels
      if (validInvokeChannel.includes(channel)) {
        return await ipcRenderer.invoke(channel, data);
      }

      return;
    },
    on: (channel: string, fn: Action): Action | undefined => {
      if (validReceiveChannel.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        const subscription = (_event: IpcRendererEvent, ...args: [unknown]) => {
          fn(...args);
        };
        ipcRenderer.on(channel, subscription);

        // return the function to remove listener
        return () => {
          ipcRenderer.removeListener(channel, subscription);
        };
      }
    },
    once: (channel: string, fn: Action) => {
      if (validReceiveChannel.includes(channel)) {
        ipcRenderer.once(channel, (_event, ...args) => fn(...args));
      }
    },
  };
}

function getArrayOfValidChannel(channels: IChannels): string[] {
  const result: string[] = Object.keys(channels);
  return result;
}
