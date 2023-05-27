import { ITestRoutine } from "../../file-defs";
import { createNameWithoutExt } from "../utils/createName";
import { IDataSetInfo } from "./dataSetInfo";

const generateDatasetInfos = (testRoutine: ITestRoutine): IDataSetInfo[] => {
  const datasets: IDataSetInfo[] = testRoutine.dataSets.map((dataset) => {
    const dsName = createNameWithoutExt(dataset.name);

    const dsInfo: IDataSetInfo = {
      name: dsName,
      description: dataset.description,

      // Obtain dataset values from data of each step
      values: testRoutine.steps.map((step) => {
        return step.data[dataset.id];
      }),
    };

    return dsInfo;
  });
  return datasets;
};

export default generateDatasetInfos;
