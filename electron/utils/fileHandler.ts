import path from "path";

type callbackFn = (arg: { error?: number; path?: string }) => void;

export default function fileHandler(req: { url: string }, callback: callbackFn) {
  console.log("File handler", req);

  const url = req.url.replace(/^rm-file:\/\//, "");

  let check = true; // Write some code here to check if you should return the file to renderer process

  if (!check) {
    callback({
      error: -6,
    });
    return;
  }

  const decodedUrl = decodeURI(url); // Needed in case URL contains spaces
  try {
    return callback({ path: path.join(decodedUrl) });
  } catch (error) {
    console.error("ERROR: registerLocalVideoProtocol: Could not get file path:", error);
  }
}
