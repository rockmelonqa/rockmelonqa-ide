import os from "os";
export class StringBuilder {
  private buffer: string[];

  constructor() {
    this.buffer = [];
  }

  append(str: string) {
    this.buffer.push(str);
  }

  appendLine(str: string) {
    this.buffer.push(str + os.EOL);
  }

  toString() {
    return this.buffer.join("");
  }
}
