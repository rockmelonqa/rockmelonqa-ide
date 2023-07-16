export const cleanUpStrangeChars = (str: string) => {
  // Not sure why output from `npx playwright` has '\x1B' characters
  return str?.replaceAll("\x1B", "");
};
