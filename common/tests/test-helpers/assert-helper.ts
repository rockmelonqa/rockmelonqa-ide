import { compareSync, Difference, fileCompareHandlers, Options } from "dir-compare";
import { error, info, log } from "console";

let options: Options = {
  compareContent: true,
  excludeFilter:
    "/.vscode,/bin,/obj,/TestResults,/test-results,/net6.0,/node_modules,package-lock.json,sample.test.ts,/.jest,README.md,trxer",
  compareFileSync: fileCompareHandlers.lineBasedFileCompare.compareSync,
  ignoreLineEnding: true, // Ignore crlf/lf line ending differences

  // ignoreWhiteSpaces: true,     // Ignore white spaces at the beginning and ending of a line (similar to 'diff -b')
  // ignoreAllWhiteSpaces: true,  // Ignore all white space differences (similar to 'diff -w')
  // ignoreEmptyLines: true       // Ignores differences caused by empty lines (similar to 'diff -B')
};

/**
 * Copies the source rmproj to folder `rockmelon-sample-rmproj` in `temp` directory
 * runs `codegen` and verifies the `output-code` against the sample output test project.
 */
/** Compares actual output and the sample output */
export const doAssert = (outputDir: string, sampleOutputDir: string) => {
  const res = compareSync(outputDir, sampleOutputDir, options);

  // Make sure no differences
  let differences = res.diffSet?.filter((comp) => comp.state !== "equal");

  printDiff(differences);

  // Expect NO differences
  expect(differences?.length).toBe(0);
};

/** Prints failure info */
const printDiff = (differences: Difference[] | undefined) => {
  log("######################");
  log("#### DIFFERENCES: ####");
  log("######################");
  if (differences?.length) {
    for (let diff of differences) {
      log(`-- File/folder name: ${diff.name1 || diff.name2}`);
      log(`   Expected file/folder (in sample output dir): ${diff.path2}`);
      log(`   Actual file/folder (in actual output dir): ${diff.path1}`);
      log(`   Reason: ${diff.state}/${diff.state === "right" ? diff.type1 : diff.type2}`);
    }
  } else {
    info("(no differences)");
  }
};
