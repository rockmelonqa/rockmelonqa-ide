export class RunSettingsFile {
    RunSettings: RunSettings = new RunSettings();
}

export class RunSettings {
    Playwright: PlaywrightSetting = new PlaywrightSetting();
}

export class PlaywrightSetting {
    ExpectTimeout: number = 10_000;
    BrowserName: string = 'chromium';
    LaunchOptions: LaunchOptionsSetting = new LaunchOptionsSetting();
}
export class LaunchOptionsSetting {
    Headless: boolean = false;
}
