import { EOL } from "os";
import { IEnvironmentFile } from "../../file-defs";

export interface IEnvironmentVariableFileGenerator {
  generate(configFile: IEnvironmentFile): string;
}

export class WindowEnvironmentVariableFileGenerator implements IEnvironmentVariableFileGenerator {
  generate(configFile: IEnvironmentFile): string {
    const setters = [];
    for (let varItem of configFile.content.settings) {
      setters.push(`SETX ${varItem.name} "${varItem.value}"`);
    }
    const commandItems: string[] = [];
    commandItems.push("@echo off");
    commandItems.push("SETLOCAL");
    commandItems.push(...setters);

    const content = commandItems.join(EOL);
    return content;
  }
}

export class UnixEnvironmentVariableFileGenerator implements IEnvironmentVariableFileGenerator {
  generate(configFile: IEnvironmentFile): string {
    return "# Not implemented";
  }
}
