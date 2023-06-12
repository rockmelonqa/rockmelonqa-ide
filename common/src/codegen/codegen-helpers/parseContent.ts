/** Parses the json string. If parse successfully, return the [content, true]; If not, return [{<empty object>}, false] */
export default <TContent>(contentStr: string): [TContent, boolean] => {
  try {
    let obj = JSON.parse(contentStr);
    return [obj, true];
  } catch {
    return [{} as TContent, false];
  }
};
