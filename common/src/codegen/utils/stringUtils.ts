import { StandardOutputFile } from "../../file-defs";

/** Escapse double quotes and back slash characters so that the string can be inlined in the output code */
export const escapeStr = (text: string) => {
  return text.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
};

export const createEnvironmentVariableString = (varName: string) => {
  return `${StandardOutputFile.EnvironmentSettings}.${varName}`;
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

/** Creates a new string with lowercase first letter from the given source string   */
export const lowerCaseFirstChar = (str: string) => {
  return str.substring(0, 1).toLowerCase() + str.substring(1);
};

/** Creates a new string with UPPERCASE first letter from the given source string   */
export const upperCaseFirstChar = (str: string) => {
  return str.substring(0, 1).toUpperCase() + str.substring(1);
};

export function startsWithNumber(str: string): boolean {
  return /^\d/.test(str);
}

export function camelCaseToDash(myStr: string) {
  return myStr
    .replace(/(^[A-Z])/, ([first]) => first.toLowerCase())
    .replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
}

export const LINE_ENDING_REGEX = /\r?\n/;
