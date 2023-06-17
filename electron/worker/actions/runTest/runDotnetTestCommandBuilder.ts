import { IRunTestSettings } from 'rockmelonqa.common/ipc-defs/testRunner';
import { ICommandBuilder } from './commandBuilder';
import path from 'path';
import { IInvokeEnvironmentFileCmdBuilder } from './invokeEnvironmentFileCmdBuilder';

export default class RunDotnetTestCommandBuilder implements ICommandBuilder {
  private readonly invokeEnvironmentFileCmdBuilder: IInvokeEnvironmentFileCmdBuilder
  
  constructor(invokeEnvironmentFileCmdBuilder: IInvokeEnvironmentFileCmdBuilder) {
    this.invokeEnvironmentFileCmdBuilder = invokeEnvironmentFileCmdBuilder;  
  }

  build(settings: IRunTestSettings, resultFilePath: string) {
    const commands = [];

    if (settings.environmentFile) {
      const invokeFileCmd = this.invokeEnvironmentFileCmdBuilder.build(settings.environmentFile);
      commands.push(invokeFileCmd);
    }

    const filterStr = settings.dotnetFilterStr ? `--filter "${settings.dotnetFilterStr}"` : '';
    const browserStr = settings.browser
      ? `Playwright.BrowserName=${settings.browser}`
      : 'Playwright.LaunchOptions.Headless=true';

    commands.push(
      // See https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-test for more details about `dotnet test`
      // stand at 'output-code/bin' folder
      `dotnet test ${filterStr} -l:"trx;LogFileName=${`..${path.sep}..${path.sep}${resultFilePath}`}" -- ${browserStr}`
    );

    const cmd = commands.join(' && ');

    return cmd;
  }
}
