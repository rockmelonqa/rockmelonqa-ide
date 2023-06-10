import recursive from "recursive-readdir";

/** Reads all files in the provided directory recursively */
const readDirRecursive = async (dir: string) => {
  let paths = await new Promise<string[]>((rs, rj) =>
    recursive(dir, [], function (err: any, files: string[]) {
      if (err) {
        rj(err);
        return;
      }
      rs(files.map((f) => f.replace(dir, "").substring(1)));
    })
  );
  return paths;
};

/** Reads all files with the provided extension in the provided directory recursively. Extension includes the dot, eg ".page, .tcase" */
export const readDirRecursiveFilterByExt = async (dir: string, ext: string) => {
  let paths = await readDirRecursive(dir);
  paths = paths.filter((filePath) => filePath.toLocaleLowerCase().endsWith(ext));
  return paths;
};
