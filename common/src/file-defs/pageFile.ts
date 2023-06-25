import { IFileDef } from "./fileDef";
import { LocatorType } from "./locatorType";

/** Page element */
export interface IPageElement {
  id: string;
  name?: string;
  type: "pageElement" | "comment";
  findBy?: LocatorType;
  locator?: string;
  description?: string;
  comment?: string;
}

/** Content of a page file */
export interface IPage {
  id: string;
  description?: string;
  elements: IPageElement[];
}

/** Page file info */
export interface IPageFile extends Omit<IFileDef, "content"> {
  content: IPage;
}
