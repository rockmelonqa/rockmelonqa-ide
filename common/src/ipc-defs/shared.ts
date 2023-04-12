export interface IIpcGenericResponse<T> {
  isSuccess: boolean;
  errorCode?: string;
  errorMessage?: string;
  data?: T;
}

export type IIpcResponse = IIpcGenericResponse<any>;

export type Action = (...args: unknown[]) => void;

export interface IProgressDetail {
  log?: string;
  data?: any;
}

export interface IProgressEvent extends IProgressDetail {
  type: string;
}
