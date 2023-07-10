import { LocatorType } from "../../src/file-defs";
import { IElement } from "./rm-project-spec.types";

export function locatorAttritube(name: string, locatorType: LocatorType): IElement {
  return {
    id: "",
    type: "pageElement",
    name,
    findBy: locatorType,
    locator: "data-abd=def",
    description: name,
  };
}
