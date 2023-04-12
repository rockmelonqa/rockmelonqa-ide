import { IFileDef } from "./fileDef";

export interface IRecentFile {
  filePath: string;
  projectName: string;
}

/** User specific settings for rockmelon qa*/
export interface IUserSettings {
  recentFiles: IRecentFile[];
}

export interface IUserSettingsFile extends Omit<IFileDef, "content"> {
  content: IUserSettings;
}
