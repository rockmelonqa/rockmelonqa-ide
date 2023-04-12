export interface APIChannels {
  nameAPI: string;
  validSendChannel: IChannels;
  validInvokeChannel: IChannels;
  validReceiveChannel: string[];
}

export interface IChannels {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [key: string]: Function;
}
