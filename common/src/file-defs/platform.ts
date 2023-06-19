/** PlatformName: Windows or Unix */
export type PlatformName = "Windows" | "Unix";

/** Contains helper methods to determine current Platform: i.e Windows or Unix */
export class Platform {
  static GetName(): PlatformName {
    if (process.platform === "win32") {
      return "Windows";
    }
    return "Unix";
  }
  static IsWindows(): boolean {
    return process.platform === "win32";
  }
  static IsUnix(): boolean {
    return process.platform !== "win32";
  }
}
