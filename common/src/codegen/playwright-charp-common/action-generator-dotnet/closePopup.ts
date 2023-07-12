/** Generates Csharp code for action Closing a "Popup" tab */
export default () => {
  return `
await defs.Page.CloseAsync();
defs = new PageDefinitions(this.Page);
  `.trim();
};
