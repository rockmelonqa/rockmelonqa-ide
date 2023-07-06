import { ICommandBuilder } from './commandBuilder';
import fs from 'fs';
import path from 'path';
import { RunSettingsFile } from './runsettingFile';
import convert from 'xml-js';
import { Platform, StandardOutputFile } from 'rockmelonqa.common/file-defs';
import { IInvokeEnvironmentFileCmdBuilder, UnixInvokeEnvironmentFileCmdBuilder, WindowsInvokeEnvironmentFileCmdBuilder } from './invokeEnvironmentFileCmdBuilder';
import { IRunTestSettings } from '../runTest';
const XML_OPTIONS = { compact: true, ignoreComment: true, spaces: 2 };

export default class RunXUnitCommandBuilder implements ICommandBuilder {

  private readonly invokeEnvironmentFileCmdBuilder: IInvokeEnvironmentFileCmdBuilder

  constructor() {
    this.invokeEnvironmentFileCmdBuilder = Platform.IsWindows() ? new WindowsInvokeEnvironmentFileCmdBuilder() : new UnixInvokeEnvironmentFileCmdBuilder()
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

    const filterStr = settings.filter ? `--filter "${settings.filter}"` : '';
    const testResultFileRelPath = path.join(settings.testResultFolderRelPath, settings.testResultFileName);

    commands.push(`dotnet test ${filterStr} -l:"trx;LogFileName=${`..${path.sep}..${path.sep}${testResultFileRelPath}`}"`);

    const cmd = commands.join(' && ');

    return cmd;
  }
}
