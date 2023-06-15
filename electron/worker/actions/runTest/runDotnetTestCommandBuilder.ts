import { IRunTestSettings } from 'rockmelonqa.common/ipc-defs/testRunner';
import { ICommandBuilder } from './commandBuilder';
import path from 'path';

export default class RunDotnetTestCommandBuilder implements ICommandBuilder {
  build(settings: IRunTestSettings, resultFilePath: string) {
    const commands = [];

    if (settings.environmentFile) {
      commands.push(`.\\${settings.environmentFile}`);
    }

    const filterStr = settings.dotnetFilterStr ? `--filter "${settings.dotnetFilterStr}"` : '';
    const browserStr = settings.browser
      ? `Playwright.BrowserName=${settings.browser}`
      : 'Playwright.LaunchOptions.Headless=true';

    // See https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-test for more details about `dotnet test`
    // stand at 'output-code/bin' folder
    commands.push(
      `dotnet test ${filterStr} -l:"trx;LogFileName=${`..${path.sep}..${path.sep}${resultFilePath}`}" -- ${browserStr}`
    );

    const cmd = commands.join(' && ');

    return cmd;
  }
}
