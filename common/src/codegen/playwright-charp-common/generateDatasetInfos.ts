import { ITestRoutine } from "../../file-defs";
import { createCleanName } from "../utils/createName";
import { IDataSetInfo } from "./dataSetInfo";

const generateDatasetInfos = (testRoutine: ITestRoutine): IDataSetInfo[] => {
  const datasets: IDataSetInfo[] = testRoutine.dataSets.map((dataset) => {
    const dsName = createCleanName(dataset.name);

    const dsInfo: IDataSetInfo = {
      name: dsName,
      description: dataset.description,

      // Obtain dataset values from data of each step
      values: testRoutine.steps.map((step) => {
        if (step.type === "testStep") {
          return step.data[dataset.id];
        }
        // For comments, return empty string
        return "";
      }),
    };

    return dsInfo;
  });
  return datasets;
};

export default generateDatasetInfos;
