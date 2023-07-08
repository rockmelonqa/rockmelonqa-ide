import { IRunTestSettings } from "rockmelonqa.common/ipc-defs/testRunner";
import { ICommandBuilder } from "./commandBuilder";
import fs from "fs";
import path from "path";
import { RunSettingsFile } from "./runsettingFile";
import convert from "xml-js";
import {
  Platform,
  StandardFileExtension,
  StandardOutputFile,
  StandardOutputFolder,
} from "rockmelonqa.common/file-defs";
import {
  IInvokeEnvironmentFileCmdBuilder,
  UnixInvokeEnvironmentFileCmdBuilder,
  WindowsInvokeEnvironmentFileCmdBuilder,
} from "./invokeEnvironmentFileCmdBuilder";
import { ITestCaseInfo } from "rockmelonqa.common/codegen/types";

export default class RunPlaywrightCommandBuilder implements ICommandBuilder {
  private readonly invokeEnvironmentFileCmdBuilder: IInvokeEnvironmentFileCmdBuilder;

  constructor() {
    this.invokeEnvironmentFileCmdBuilder = Platform.IsWindows()
      ? new WindowsInvokeEnvironmentFileCmdBuilder()
      : new UnixInvokeEnvironmentFileCmdBuilder();
  }

  private buildFilter(testCases: ITestCaseInfo[]): string {
    const individualTestCaseFilters: string[] = [];
    for (const testCaseInfo of testCases) {
      if (!testCaseInfo.lineNumber) {
        continue;
      }
      if (!testCaseInfo.constainerSuiteFileRelPath) {
        continue;
      }

      const testSuiteRelPath = testCaseInfo.constainerSuiteFileRelPath.split(path.sep).join("/");
      const testCaseFilter = `${testSuiteRelPath}:${testCaseInfo.lineNumber}`;
      individualTestCaseFilters.push(testCaseFilter);
    }
    return individualTestCaseFilters.join(" ");
  }

  build(settings: IRunTestSettings) {
    const commands = [];

    if (settings.environmentFile) {
      const invokeFileCmd = this.invokeEnvironmentFileCmdBuilder.build(settings.environmentFile);
      commands.push(invokeFileCmd);
    } else if (Platform.IsWindows()) {
      // On Windows, we need to clean the environment variable of previous run
      const invokeFileCmd = this.invokeEnvironmentFileCmdBuilder.build(
        `${StandardOutputFolder.DotEnvironment}${path.sep}rmv.env${StandardFileExtension.Bat}`
      );

      commands.push(invokeFileCmd);
    }

    const filterStr = this.buildFilter(settings.testCases);
    const browserStr = settings.browser ? `--headed --project=${settings.browser}` : "";

    commands.push(
      // See https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-test for more details about `dotnet test`
      // stand at 'output-code/bin' folder
      `npx playwright test ${filterStr} ${browserStr}`
    );

    let cmd = commands.join(" && ");

    return cmd;
  }
}
