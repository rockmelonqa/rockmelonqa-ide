console.log("Copy template files");

import fse from "fs-extra";
import path from "path";

import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __rootDir = path.resolve(__dirname, "..");

const COMMONJS = "commonjs";
const MODULE = "module";

const FROM = path.resolve(__rootDir, "src/codegen");
const TO = path.resolve(__rootDir, "dist/{{package-type}}/codegen/{{codegen}}/templates");

const copy = (from, to, codegen) => {
  console.log("Copy templates for", codegen);
  var fromSrc = path.join(from, codegen, "templates");
  var toCommon = to.replace("{{package-type}}", COMMONJS).replace("{{codegen}}", codegen);
  fse.copySync(fromSrc, toCommon, { overwrite: true });
  var toModule = to.replace("{{package-type}}", MODULE).replace("{{codegen}}", codegen);
  fse.copySync(fromSrc, toModule, { overwrite: true });
};

copy(FROM, TO, "playwright-csharp-mstest");
copy(FROM, TO, "playwright-csharp-nunit");
copy(FROM, TO, "playwright-typescript-jest");
