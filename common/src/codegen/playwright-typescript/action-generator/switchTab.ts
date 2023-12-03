import { ActionDataType, IActionTemplateParam } from "../../types";
import { createEnvironmentVariableString, escapeStr } from "../../utils/stringUtils";

/** Generates Typescript code for action Switch Tab */
export default (params: IActionTemplateParam) => {
  let data = "";
  if (params.data.dataType === ActionDataType.LiteralValue) {
    let numberValue = parseInt(String(params.data.rawData));
    if (!isNaN(numberValue)) {
      data = String(numberValue);
    } else {
      data = `"${escapeStr(String(params.data.rawData))}"`;
    }
  } else {
    data = createEnvironmentVariableString(String(params.data.rawData));
  }

  return `
  await this.pageTest.switchTab(${data});
  `.trim();
};
