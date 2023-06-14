import { IFileDef } from "./fileDef";

export interface ISetting {
  name: string;
  value: string;
}

export interface IEnvironmentContent {
  settings: ISetting[];
}

export interface IEnvironmentFile extends Omit<IFileDef, "content"> {
  content: IEnvironmentContent;
}
