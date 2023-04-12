import type { Config } from "@jest/types";
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: { "^.+\\.ts?$": "ts-jest" },

  testPathIgnorePatterns: ["dist", "dist/commonjs", "unit-test-files"],
};
export default config;
