import path from "path";
import fs from "fs";
import { BrowserContext, Page, TestInfo, test as base } from "@playwright/test";
import EnvironmentSettings from "~/config/EnvironmentSettings";

const saveScreenshots = async (page: Page, testInfo: TestInfo) => {
  if (!EnvironmentSettings.TakeScreenshotOnError) {
    return;
  }

  if (testInfo.status === "passed") {
    return;
  }

  let [suiteFileName, testCaseName] = testInfo.titlePath;
  suiteFileName = suiteFileName
    // Remove .spec.ts from suite file name
    .replace(/\.spec\.ts$/i, "")
    // Replace path sep with _
    .replace(path.sep, "_");

  const screenshotFileName = `${suiteFileName}_${testCaseName}_error.png`;

  const playwrightResultScreenshotsDir = path.resolve("./test-results/screenshots");

  if (!fs.existsSync(playwrightResultScreenshotsDir)) {
    fs.mkdirSync(playwrightResultScreenshotsDir);
  }

  try {
    const saveScreenshotTo = path.join(playwrightResultScreenshotsDir, screenshotFileName);
    await page.screenshot({ path: saveScreenshotTo, fullPage: true });
    console.log("Saved screenshot to", saveScreenshotTo);
  } catch (err) {
    console.log("saveScreenshots Failed");
    console.error(err);
  }
};

const saveVideos = async (page: Page, browserContext: BrowserContext, testInfo: TestInfo) => {
  console.log("Save video", EnvironmentSettings.RecordVideoMode, testInfo.status);
  if (EnvironmentSettings.RecordVideoMode === "off") {
    return;
  }

  if (EnvironmentSettings.RecordVideoMode === "retain-on-failure") {
    if (testInfo.status === "passed") {
      return;
    }
  }

  if (EnvironmentSettings.RecordVideoMode === "on") {
    // Proceed
  }

  let [suiteFileName, testCaseName] = testInfo.titlePath;
  suiteFileName = suiteFileName
    // Remove .spec.ts from suite file name
    .replace(/\.spec\.ts$/i, "")
    // Replace path sep with _
    .replace(path.sep, "_");
  const errorIndicator = testInfo.status === "passed" ? "" : "_error";
  const playwrightResultVideosDir = path.resolve("./test-results/videos");
  if (!fs.existsSync(playwrightResultVideosDir)) {
    fs.mkdirSync(playwrightResultVideosDir);
  }
  const videoFileName = `${suiteFileName}_${testCaseName}${errorIndicator}.webm`;
  const saveVideoTo = path.join(playwrightResultVideosDir, videoFileName);
  const pageVideo = page.video();

  try {
    await browserContext.close();
    const videoFile = await pageVideo.saveAs(saveVideoTo);
  } catch (err) {
    console.error(err);
  }
};

export const initTest = () => {
  const test = base.extend<{ page: Page; context: BrowserContext }>({
    page: async ({ page }, use) => {
      await use(page);
    },
  });

  test.afterEach(async ({ page, context }, testInfo) => {
    await saveScreenshots(page, testInfo);
    await saveVideos(page, context, testInfo);
  });

  return test;
};

export { expect } from "@playwright/test";
