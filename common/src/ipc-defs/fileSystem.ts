export interface IAddFileWatchEventArgs {
  path: string;
  isReady: boolean;
}

/**
 * Interface represents file system or folder
 */
export interface IFileSystemInfo {
  path: string;
  name?: string;
  isDir?: boolean;
  hasChildren?: boolean;
  children?: IFileSystemInfo[];
  error?: any;
}

export interface IGetFolderRequest {
  path: string;
  includeChildren?: boolean;
}

export interface IRenameFileRequest {
  oldPath: string;
  newPath: string;
}

export interface IWriteFileRequest {
  filePath: string;
  fileContent: string;
}
