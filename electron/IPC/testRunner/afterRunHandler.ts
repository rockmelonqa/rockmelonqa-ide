import "ts-replace-all";

import { Language } from "rockmelonqa.common";
import { IRunTestContext } from "rockmelonqa.common/ipc-defs";
import { StringBuilder } from "../../utils/stringBuilder";
import AfterRunHandlerTypeScript from "./afterRunHandlerTypescript";
import AfterRunHandlerDotnet from "./afterRunHandlerDotnet";

/** AfterRunHandler that performs additional operations after the test run finished */
export interface IAfterRunHandler {
  /** Performs addtional operations */
  handle(context: IRunTestContext, logBuilder: StringBuilder): Promise<void>;
}

/** Contains factory method to create instance of AfterRunHandler  */
export class AfterRunHandlerFactory {
  static getInstance(language: Language): IAfterRunHandler {
    if (language === Language.Typescript) {
      return new AfterRunHandlerTypeScript();
    }
    if (language === Language.CSharp) {
      return new AfterRunHandlerDotnet();
    }
    throw new Error(`DEV ERROR: cannot get instance of AfterRunHandler for language ${language}`);
  }
}
