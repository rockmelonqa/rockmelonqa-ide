/** PlatformName: Windows or Unix */
export type PlatformName = "Windows" | "Unix";

/** Contains helper methods to determine current OS: i.e Windows or Unix */
export class Platform {
  /** Get the code name of the current OS */
  static GetName(): PlatformName {
    if (process.platform === "win32") {
      return "Windows";
    }
    return "Unix";
  }
  /** Is current OS a Windows system? */
  static IsWindows(): boolean {
    return process.platform === "win32";
  }
  /** Is current OS a Unix system? */
  static IsUnix(): boolean {
    return process.platform !== "win32";
  }
}
