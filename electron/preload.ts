import application from "./IPC/application";
import autoUpdater from "./IPC/autoUpdater";
import codeGenearator from "./IPC/codeGenerator";
import generateContextBridge from "./IPC/core/contextBridge";
import fileSystem from "./IPC/fileSystem";
import testRunner from "./IPC/testRunner";
import window from "./IPC/window";

generateContextBridge([application, autoUpdater, codeGenearator, testRunner, fileSystem, window], "ipc");
