import { Language } from "../../file-defs";

export const languageExtensionMap: { [key in Language]: string } = {
  [Language.CSharp]: ".cs",
  [Language.Java]: ".java",
  [Language.Python]: ".py",
  [Language.Typescript]: ".ts",
};
