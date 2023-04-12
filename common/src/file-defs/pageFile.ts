import { IFileDef } from "./fileDef";
import { LocatorType } from "./locatorType";

export interface IPageElement {
  id: string;
  name?: string;
  type: "pageElement" | "comment";
  findBy?: LocatorType;
  locator?: string;
  description?: string;
  comment?: string;
}

export interface IPage {
  id: string;
  description?: string;
  elements: IPageElement[];
}

export interface IPageFile extends Omit<IFileDef, "content"> {
  content: IPage;
}
