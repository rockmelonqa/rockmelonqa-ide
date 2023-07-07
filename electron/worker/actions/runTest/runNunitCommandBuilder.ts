import { ICommandBuilder } from "./commandBuilder";
import RunDotnetTestCommandBuilder from "./runDotnetTestCommandBuilder";
import { IInvokeEnvironmentFileCmdBuilder, UnixInvokeEnvironmentFileCmdBuilder, WindowsInvokeEnvironmentFileCmdBuilder } from "./invokeEnvironmentFileCmdBuilder";
import { Platform } from "rockmelonqa.common/file-defs";
import { IRunTestSettings } from "../runTest";

export default class RunNunitCommandBuilder implements ICommandBuilder {
  private readonly invokeEnvironmentFileCmdBuilder: IInvokeEnvironmentFileCmdBuilder

  constructor() {
    this.invokeEnvironmentFileCmdBuilder = Platform.IsWindows() ? new WindowsInvokeEnvironmentFileCmdBuilder() : new UnixInvokeEnvironmentFileCmdBuilder()
  }
  
  build(settings: IRunTestSettings) {
    let cmd = new RunDotnetTestCommandBuilder(this.invokeEnvironmentFileCmdBuilder).build(settings);
    return cmd;
  }
}
