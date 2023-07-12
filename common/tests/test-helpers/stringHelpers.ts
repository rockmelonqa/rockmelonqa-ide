import { EOL } from "os";

/** Normalizes line endings of a string, i.e replace any line endings characters with current system EOL*/
export const normalizeLineEndings = (str: string, normalized: string = EOL) => str.replace(/\r?\n/g, normalized);
