import { error, log } from "console";

export const Log = {
    Logger: {
      Information(...args: any[]) {
        log.apply(null, args);
      },
      Error(...args: any[]) {
        error.apply(null, args);
      },
    },
  };