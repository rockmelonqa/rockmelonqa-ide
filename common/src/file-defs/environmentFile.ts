import { IFileDef } from "./fileDef";

/** A setting item, contains a `name` (variable name) and a `value` (variable value) */
export interface ISetting {
  /** Variable name */
  name: string;
  /** Variable value */
  value: string;
}

/** Content of a environment .env  file */
export interface IEnvironmentContent {
  settings: ISetting[];
}

/** Environment file info */
export interface IEnvironmentFile extends Omit<IFileDef, "content"> {
  content: IEnvironmentContent;
}
