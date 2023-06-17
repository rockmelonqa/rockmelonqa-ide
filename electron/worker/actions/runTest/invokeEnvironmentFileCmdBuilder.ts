import path from "path";

/** Builder that builds the commandline string to invoke the enviroment setter script file */
export interface IInvokeEnvironmentFileCmdBuilder {
    build(envFileRelPath: string): string;
}

/** Builder that builds the commandline string to invoke the enviroment setter script file (.env.bat file) on Windows*/
export class WindowsInvokeEnvironmentFileCmdBuilder implements IInvokeEnvironmentFileCmdBuilder {
    build(envFileRelPath: string): string {
        return `.${path.sep}${envFileRelPath}`;
    }
}

/** Builder that builds the commandline string to invoke the enviroment setter script file (.env.sh file) on Unix systems*/
export class UnixInvokeEnvironmentFileCmdBuilder implements IInvokeEnvironmentFileCmdBuilder {
    build(envFileRelPath: string): string {
        return `chmod +x .${path.sep}${envFileRelPath} && . .${path.sep}${envFileRelPath}`;
    }
}