import {
  IRmProjFile,
  ISetting,
  ISourceProjectMetadata,
  StandardFileExtension,
  StandardOutputFolder,
} from "../../file-defs";
import { WriteFileFn } from "../types";
import path from "path";
import {
  IEnvironmentVariableFileGenerator,
  UnixEnvironmentVariableFileGenerator,
  WindowEnvironmentVariableFileGenerator,
} from "../codegen-common/environmentVariableFileGenerator";
import { Platform } from "../../file-defs/platform";
import { languageExtensionMap } from "../utils/languageExtensionMap";
import { indentCharMap } from "../utils/stringUtils";

export class CodeGenBase {
  protected _projMeta: ISourceProjectMetadata;
  protected _envVarFileGenerator: IEnvironmentVariableFileGenerator;
  protected _outputFileExt: string;
  protected _rmprojFile: IRmProjFile;

  protected _indentString: string;
  protected _indentChar: string;
  protected _indentSize: number;

  constructor(projMeta: ISourceProjectMetadata) {
    this._projMeta = projMeta;
    this._rmprojFile = projMeta.project;
    this._outputFileExt = languageExtensionMap[projMeta.project.content.language];

    /** Space char of tab char */
    this._indentChar = indentCharMap.get(projMeta.project.content.indent)!;
    /** Size of 1 index: eg. 2 spaces or 4 spaces */
    this._indentSize = projMeta.project.content.indentSize;
    /** String representing 1 indent */
    this._indentString = this._indentChar.repeat(this._indentSize);

    this._envVarFileGenerator = Platform.IsWindows()
      ? new WindowEnvironmentVariableFileGenerator()
      : new UnixEnvironmentVariableFileGenerator();
  }

  protected async generateEnvironmentSetterScripts(writeFile: WriteFileFn) {
    for (let configFile of this._projMeta.environmentFiles) {
      const fileContent = this._envVarFileGenerator.generate(configFile.content);
      const sourceFileNameWithoutExt = path.parse(configFile.fileName).name;
      const fileExt = Platform.IsWindows() ? StandardFileExtension.Bat : StandardFileExtension.Sh;
      await writeFile(
        `${StandardOutputFolder.DotEnvironment}/run.${sourceFileNameWithoutExt}.env${fileExt}`,
        fileContent
      );
    }

    // For Windows, generate a bat file that remove environment variable
    if (Platform.IsWindows()) {
      // Obtains all varnames from all config files
      let varnames = [];
      for (let configFile of this._projMeta.environmentFiles) {
        varnames.push(...configFile.content.settings.map((setting) => setting.name));
      }
      // Get unique name
      varnames = [...new Set(varnames)];

      // Generate the clear file
      const settings: ISetting[] = varnames.map((name) => ({ name, value: "" }));
      const fileContent = this._envVarFileGenerator.generate({ settings });
      await writeFile(
        `${StandardOutputFolder.DotEnvironment}${path.sep}rmv.env${StandardFileExtension.Bat}`,
        fileContent
      );
    }
  }
}
