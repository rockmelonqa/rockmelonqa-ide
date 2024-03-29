import { IRunTestSettings } from "rockmelonqa.common/ipc-defs/testRunner";
import { ICommandBuilder } from "./commandBuilder";
import fs from "fs";
import path from "path";
import { RunSettingsFile } from "./runsettingFile";
import convert from "xml-js";
import { Platform, StandardOutputFile } from "rockmelonqa.common/file-defs";
import {
  IInvokeEnvironmentFileCmdBuilder,
  UnixInvokeEnvironmentFileCmdBuilder,
  WindowsInvokeEnvironmentFileCmdBuilder,
} from "./invokeEnvironmentFileCmdBuilder";
const XML_OPTIONS = { compact: true, ignoreComment: true, spaces: 2 };

export default class RunXUnitCommandBuilder implements ICommandBuilder {
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
    }

    const runSettingsFile = new RunSettingsFile();
    runSettingsFile.RunSettings.Playwright.LaunchOptions.Headless = !settings.browser;
    runSettingsFile.RunSettings.Playwright.BrowserName = settings.browser;
    const settingJson = JSON.stringify(runSettingsFile);
    const settingXml = convert.json2xml(settingJson, XML_OPTIONS);
    fs.writeFileSync(path.join(settings.sourceCodeFolderPath, StandardOutputFile.RunSettings), settingXml);

    const filter = settings.testCases.map((x) => x.fullyQualifiedName).join("|");
    const filterStr = filter ? `--filter "${filter}"` : "";
    const testResultFileRelPath = path.join(settings.testResultFolderRelPath, settings.testResultFileName);

    commands.push(
      `dotnet test ${filterStr} -l:"trx;LogFileName=${`..${path.sep}..${path.sep}${testResultFileRelPath}`}"`
    );

    const cmd = commands.join(" && ");

    return cmd;
  }
}
