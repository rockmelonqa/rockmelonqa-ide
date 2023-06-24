/** Contains info of dataset that will be rendered in hbs template */

export interface IDataSetInfo {
  name: string;
  description: string;
  values: string[];
}

/** Wrapper class of an internal data sets array */
export class DataSetCollection {
  /** The actual data sets array */
  private dataSets: string[];

  constructor(dataSets: string[] | any) {
    this.dataSets = dataSets || [];
  }

  /** Does the dataSets array contain ALL dataset item? => When the data sets array contains only one item "*" */
  isAll(): boolean {
    if (this.dataSets.length !== 1) {
      return false;
    }

    return this.dataSets[0] === "*";
  }

  /** Returns the actual data set ids array; Returns empty array if the data set ids is not an actual array */
  get() {
    return this.dataSets || [];
  }

  /** Remove all data set ids */
  empty() {
    this.dataSets.length = 0;
  }

  /** Add more data set ids to the collection */
  addMany(dataSetIds: string[]) {
    this.dataSets.push(...dataSetIds);
  }
}
