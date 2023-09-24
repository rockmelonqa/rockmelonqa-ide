import { Page } from "@playwright/test";

/** Base class of Test classes */
export default class {
  /** Reference to the the current Playwright Page instance */
  private _page: Page;

  /** Get the current Playwright Page instance */
  public get page(): Page {
    return this._page;
  }

  constructor(page: Page) {
    this._page = page;
  }

  /** Sets the current Playwright Page instance */
  protected setPage(page: Page) {
    this._page = page;
  }

  protected async delay(ms: number) {
    await new Promise((rs) => setTimeout(rs, ms));
  }

  /** Switch the page context to tab with the provided identifier, default identifier is index 0 */
  public async switchTab(identifier: number | string | undefined) {
    let pages = this.page.context().pages();

    if (identifier === undefined) {
      this.setPage(pages[0]);
      return;
    }

    if (typeof identifier === "number") {
      if (pages[identifier] !== undefined) {
        this.setPage(pages[identifier]);
        return;
      }
      throw new Error(`Cannot locate tab (popup) with identifier index ${identifier}`);
    }

    if (typeof identifier === "string") {
      for (let page of pages) {
        let title = await page.title();
        let normalMatched = title.includes(identifier);

        if (normalMatched) {
          this.setPage(page);
          return;
        }

        let regex = new RegExp(identifier, "ig");
        let regexMatched = regex.test(title);

        if (regexMatched) {
          this.setPage(page);
          return;
        }
      }
      throw new Error(`Cannot locate tab (popup) with identifier string ${identifier}`);
    }
    throw new Error(`Cannot locate tab (popup) with identifier ${identifier}`);
  }

  /** Opens new tab/popup with the provided triggerFn */
  public async clickOpenPopup(triggerFn: () => Promise<void>) {
    var popupPromise = this._page.waitForEvent("popup");
    await triggerFn();
    var popup = await popupPromise;
    await popup.waitForLoadState();
  }
}
