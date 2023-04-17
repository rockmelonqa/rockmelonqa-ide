import { CodeGen } from "./src/codegen/codegen";
import { StandardFileExtension, StandardFolder, StandardOutputFolder } from "./src/codegen/utils";
import {
  ActionType,
  AutomationFramework,
  fileDefFactory,
  ICodeGenMeta,
  IDataSet,
  IFileDef,
  Indent,
  IRecentFile,
  IRmProj,
  IRmProjFile,
  ITestCase,
  ITestCaseFile,
  ITestRoutine,
  ITestRoutineFile,
  ITestStep,
  ITestSuite,
  ITestSuiteFile,
  IUserSettings,
  IUserSettingsFile,
  Language,
  LocatorType,
  TestFramework,
} from "./src/file-defs";
import {
  Action,
  IAddFileWatchEventArgs,
  IAppInfo,
  IFileSystemInfo,
  IGetFolderRequest,
  IIpcGenericResponse,
  IIpcResponse,
  IProgressDetail,
  IProgressEvent,
  IRenameFileRequest,
  IWriteFileRequest,
} from "./src/ipc-defs";

export {
  ActionType,
  AutomationFramework,
  fileDefFactory,
  Action,
  CodeGen,
  IAddFileWatchEventArgs,
  IAppInfo,
  ICodeGenMeta,
  IDataSet,
  IFileDef,
  IFileSystemInfo,
  IIpcGenericResponse,
  IGetFolderRequest,
  IIpcResponse,
  Indent,
  IProgressDetail,
  IProgressEvent,
  IRecentFile,
  IRenameFileRequest,
  IRmProjFile,
  IRmProj,
  ITestCase,
  ITestCaseFile,
  ITestRoutine,
  ITestRoutineFile,
  IUserSettings,
  IUserSettingsFile,
  ITestStep,
  ITestSuite,
  ITestSuiteFile,
  IWriteFileRequest,
  Language,
  LocatorType,
  StandardFileExtension,
  StandardFolder,
  StandardOutputFolder,
  TestFramework,
};