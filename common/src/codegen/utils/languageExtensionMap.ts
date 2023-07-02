import { Language } from "../../file-defs";

/** Contains mappings from Language to file extension string. E.g CSharp-> ".cs"; TypeScript=>".ts", etc...*/
export const languageExtensionMap: { [key in Language]: string } = {
  [Language.CSharp]: ".cs",
  [Language.Java]: ".java",
  [Language.Python]: ".py",
  [Language.Typescript]: ".ts",
};
