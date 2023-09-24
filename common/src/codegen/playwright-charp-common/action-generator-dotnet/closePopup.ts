/** Generates Csharp code for action Closing a "Popup" tab */
export default () => {
  return `
await this.defs.Page.CloseAsync();
defs = new PageDefinitions(this.Page);
  `.trim();
};
