import { IRunTestSettings } from 'rockmelonqa.common/ipc-defs/testRunner';
import { ICommandBuilder } from './commandBuilder';
import fs from 'fs';
import path from 'path';
import { RunSettingsFile } from './runsettingFile';
import convert from 'xml-js';
import { StandardOutputFile } from 'rockmelonqa.common/file-defs';
const XML_OPTIONS = { compact: true, ignoreComment: true, spaces: 2 };

export default class RunXUnitCommandBuilder implements ICommandBuilder {
    build(settings: IRunTestSettings, resultFilePath: string) {
        const runSettingsFile = new RunSettingsFile();
        runSettingsFile.RunSettings.Playwright.LaunchOptions.Headless = !settings.browser;
        runSettingsFile.RunSettings.Playwright.BrowserName = settings.browser;
        const settingJson = JSON.stringify(runSettingsFile);
        const settingXml = convert.json2xml(settingJson, XML_OPTIONS);
        fs.writeFileSync(path.join(settings.outputCodeDir, StandardOutputFile.RunSettings), settingXml);

        const filterStr = settings.dotnetFilterStr ? `--filter "${settings.dotnetFilterStr}"` : '';

        let cmd = `dotnet test ${filterStr} -l:"trx;LogFileName=${`..${path.sep}..${path.sep}${resultFilePath}`}"`;
        return cmd;
    }
}
