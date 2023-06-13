import { IFileDef } from "./fileDef";
import { LocatorType } from "./locatorType";

export interface IConfiguration {
  settings: { name: string; value: string }[];
}

export interface IConfigurationFile extends Omit<IFileDef, "content"> {
  content: IConfiguration;
}
