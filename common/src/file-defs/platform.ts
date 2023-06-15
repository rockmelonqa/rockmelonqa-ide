export type PlatformName = "Windows" | "Unix";

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
