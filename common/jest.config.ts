import type { Config } from "@jest/types";
// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: { "^.+\\.ts?$": "ts-jest" },

  testPathIgnorePatterns: ["dist"],

  moduleNameMapper: {
    "~/(.*)": "<rootDir>/src/$1",
  },
};
export default config;
