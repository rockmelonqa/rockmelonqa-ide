import { ISuiteInfo } from "../types";

/** Contains meta data for output test suites */
export interface IOutputProjectMetadata {
  suites: ISuiteInfo[];
  error?: { message: string };
}
