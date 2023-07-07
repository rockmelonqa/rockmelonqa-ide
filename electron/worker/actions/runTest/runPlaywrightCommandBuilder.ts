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

export default class RunPlaywrightCommandBuilder implements ICommandBuilder {
  private readonly invokeEnvironmentFileCmdBuilder: IInvokeEnvironmentFileCmdBuilder;

  constructor() {
    this.invokeEnvironmentFileCmdBuilder = Platform.IsWindows()
      ? new WindowsInvokeEnvironmentFileCmdBuilder()
      : new UnixInvokeEnvironmentFileCmdBuilder();
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

    const filterStr = "";
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
