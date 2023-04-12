import path from "path";
import fs from "fs";

/** Loads the template with the provided `templateKey`; If template exists in `customTemplatesDir` then use it, if not, use template in `embeddedTemplateDir` */
export const loadTemplate = (embeddedTemplateDir: string, customTemplatesDir: string, fileName: string): string => {
  const customTemplateFilePath = path.join(customTemplatesDir, fileName);
  if (fs.existsSync(customTemplateFilePath)) {
    return fs.readFileSync(customTemplateFilePath, "utf-8");
  }
  const embeddedTemplateFilePath = path.join(embeddedTemplateDir, fileName);
  return fs.readFileSync(embeddedTemplateFilePath, "utf-8");
};
