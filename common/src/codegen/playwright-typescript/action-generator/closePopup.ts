/** Generates Typescript code for action Closing a "Popup" tab */
export default () => {
  return `
await this.page.close();
  `.trim();
};
