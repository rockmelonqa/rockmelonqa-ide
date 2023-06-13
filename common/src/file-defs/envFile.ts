import { IFileDef } from "./fileDef";

export interface IEnvSetting {
  id: string;
  name?: string;
  value?: string;
}

export interface IEnvPage {
  settings: IEnvSetting[];
}

export interface IEnvPageFile extends Omit<IFileDef, "content"> {
  content: IEnvPage;
}
