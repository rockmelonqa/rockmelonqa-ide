import { EOL } from "os";

export const normalizeLineEndings = (str: string, normalized: string = EOL) => str.replace(/\r?\n/g, normalized);
