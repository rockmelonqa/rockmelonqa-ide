import { ICommandBuilder } from './commandBuilder';
import path from 'path';
import { IInvokeEnvironmentFileCmdBuilder } from './invokeEnvironmentFileCmdBuilder';
import { Platform, StandardFileExtension, StandardOutputFolder } from 'rockmelonqa.common/file-defs';
import { IRunTestSettings } from '../runTest';

export default class RunDotnetTestCommandBuilder implements ICommandBuilder {
  private readonly invokeEnvironmentFileCmdBuilder: IInvokeEnvironmentFileCmdBuilder;

  constructor(invokeEnvironmentFileCmdBuilder: IInvokeEnvironmentFileCmdBuilder) {
    this.invokeEnvironmentFileCmdBuilder = invokeEnvironmentFileCmdBuilder;
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

    const filterStr = settings.filter ? `--filter "${settings.filter}"` : '';
    const testResultFileRelPath = path.join(settings.testResultFolderRelPath, settings.testResultFileName);
    const browserStr = settings.browser
      ? `Playwright.BrowserName=${settings.browser}`
      : 'Playwright.LaunchOptions.Headless=true';

    commands.push(
      // See https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-test for more details about `dotnet test`
      // stand at 'output-code/bin' folder
      `dotnet test ${filterStr} -l:"trx;LogFileName=${`..${path.sep}..${path.sep}${testResultFileRelPath}`}" -- ${browserStr}`
    );

    let cmd = commands.join(' && ');

    return cmd;
  }
}
