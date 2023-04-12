import { StandardFolder, StandardOutputFolder } from "../../file-defs";

const inputOutputFolderMap = new Map<string, string>();
inputOutputFolderMap
  .set(StandardFolder.PageDefinitions, StandardOutputFolder.Pages)
  .set(StandardFolder.TestCases, StandardOutputFolder.TestCases)
  .set(StandardFolder.TestSuites, StandardOutputFolder.TestSuites)
  .set(StandardFolder.TestRoutines, StandardOutputFolder.TestRoutines);

export { inputOutputFolderMap };
