console.log("Generate package.json files");

import fs from "fs";
import path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __rootDir = path.resolve(__dirname, "..");

const packageJson = JSON.parse(fs.readFileSync(path.resolve(__rootDir, "package.json"), "utf8"));
const newPackageJson = {
  name: "rockmelonqa.common",
  main: "index.js",
  types: "index.d.ts",
  type: "module",
  devDependencies: packageJson.devDependencies,
  dependencies: packageJson.dependencies,
};
fs.writeFileSync(path.join(__rootDir, "dist/module/package.json"), JSON.stringify(newPackageJson, null, 4));

newPackageJson.type = "commonjs";
fs.writeFileSync(path.join(__rootDir, "dist/commonjs/package.json"), JSON.stringify(newPackageJson, null, 4));
