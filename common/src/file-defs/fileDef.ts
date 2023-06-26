/** Contains general file info */
export interface IFileDef {
  /** Container folder of the file */
  folderPath: string;
  /** Name of the file (with extension) */
  fileName: string;
  /** Content of the file */
  content: any;
  /** Is the file content valid and can be parsed successfully with JSON.parse() or with custom parser */
  isValid: boolean;
}
