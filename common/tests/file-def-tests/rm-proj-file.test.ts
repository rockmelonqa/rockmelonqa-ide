import os from "os";
import { AutomationFramework, Indent, IRmProj, Language, TestFramework } from "../../src/file-defs";
const tempDir = os.tmpdir(); // /tmp

describe("RmProjFile Tests", () => {
  beforeEach(() => {});

  test("FromJson test", () => {
    let o = JSON.parse('{ "fileVersion": 1, "name": "My Project", "description": "Lorem Ipsum" }') as IRmProj;
    expect(o.name).toBe("My Project");
    expect(o.fileVersion).toBe(1);
    expect(o.description).toBe("Lorem Ipsum");
  });

  test("ToJson test", () => {
    let o: IRmProj = {
      fileVersion: 1,
      name: "My Project",
      description: "Lorem Ipsum",
      automationFramework: AutomationFramework.Playwright,
      testFramework: TestFramework.JUnit,
      language: Language.CSharp,
      rootNamespace: "",
      indent: Indent.Spaces,
      indentSize: 4,
    };
    let json = JSON.stringify(o);
    expect(json).toBe(
      '{"fileVersion":1,"name":"My Project","description":"Lorem Ipsum","automationFramework":"Playwright","testFramework":"JUnit","language":"C#","rootNamespace":"","indent":"Spaces","indentSize":4}'
    );
  });
});
