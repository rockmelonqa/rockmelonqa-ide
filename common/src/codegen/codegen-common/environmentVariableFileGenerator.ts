import { EOL } from "os";
import { IEnvironmentContent } from "../../file-defs";

/** Generators for the content of the Environment setter script */
export interface IEnvironmentVariableFileGenerator {
  generate(configFile: IEnvironmentContent): string;
}

/** Generators for the content of the Environment setter script .bat file for Windows system */
export class WindowEnvironmentVariableFileGenerator implements IEnvironmentVariableFileGenerator {
  generate(configContent: IEnvironmentContent): string {
    const setters = [];
    for (let varItem of configContent.settings) {
      setters.push(`SET ${varItem.name}=${varItem.value}`);
    }
    const commandItems: string[] = [];
    commandItems.push("@echo off");
    commandItems.push(...setters);

    const content = commandItems.join(EOL);
    return content;
  }
}

/** Generators for the content of the Environment setter script .bat file for Unix system */
export class UnixEnvironmentVariableFileGenerator implements IEnvironmentVariableFileGenerator {
  generate(configContent: IEnvironmentContent): string {
    const setters = [];
    for (let varItem of configContent.settings) {
      setters.push(`export ${varItem.name}="${varItem.value}"`);
    }

    const content = setters.join(EOL);
    return content;
  }
}
