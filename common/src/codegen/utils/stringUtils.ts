import { EOL } from "os";
import { Indent } from "../../file-defs";

export const escapeStr = (text: string) => {
  return text.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
};

export const format = (strTemplate: string, ...args: any[]) => {
  var s = strTemplate;
  for (var i = 0; i < args.length; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, args[i]);
  }
  return s;
};

export const hasPlaceholder = (text: string) => {
  return /{\d+}/.test(text);
};

export const getParameters = (parameters: string[]) => {
  if (parameters == null || !parameters.length) {
    return "";
  }

  let result = "";
  for (let i = 0; i < parameters.length; ++i) {
    result += `\"${escapeStr(parameters[i])}\"`;

    let isLastParameter = i == parameters.length - 1;
    result += isLastParameter ? "" : ", ";
  }

  return result;
};

export const lowerCaseFirstChar = (str: string) => {
  return str.substring(0, 1).toLowerCase() + str.substring(1);
};
export const upperCaseFirstChar = (str: string) => {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
};

export const indentCharMap = new Map<Indent, string>([
  [Indent.Tabs, "\t"],
  [Indent.Spaces, " "],
]);

export const addIndent = (sourceStr: string, indentStr: string) => {
  let lines = sourceStr.split(EOL);
  lines = lines.map((l) => (l.trim() ? indentStr + l : l));
  let result = lines.join(EOL);
  return result;
};

export function startsWithNumber(str: string): boolean {
  return /^\d/.test(str);
}
