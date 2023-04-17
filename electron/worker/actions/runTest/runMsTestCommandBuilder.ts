import { IRunTestSettings } from "rockmelonqa.common/ipc-defs/testRunner";
import { ICommandBuilder } from "./commandBuilder";
import RunDotnetTestCommandBuilder from "./runDotnetTestCommandBuilder";

export default class RunMsTestCommandBuilder implements ICommandBuilder {
  build(settings: IRunTestSettings, resultFilePath: string) {
    let cmd = new RunDotnetTestCommandBuilder().build(settings, resultFilePath);
    return cmd;
  }
}
