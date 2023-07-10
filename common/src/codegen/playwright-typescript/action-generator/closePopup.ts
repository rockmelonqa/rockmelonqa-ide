/** Generates Csharp code for action Closing a "Popup" tab */
export default () => {
  return `
    await defs.page.close();
    defs = new PageDefinitions(this.page);
  `;
};
