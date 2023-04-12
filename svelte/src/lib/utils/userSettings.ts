import { application } from '$lib/ipc';
import type { IRecentFile } from 'rockmelonqa.common/file-defs';

/**
 * Remove recent file item out of user setting
 * @param filePath Project file path
 * @returns Latest recent projects list
 */
export const removeRecentProjects = async (filePath: string): Promise<IRecentFile[]> => {
    const data = await application.getUserSettings();
    data.recentFiles = data.recentFiles.filter((x: IRecentFile) => x.filePath !== filePath);
    application.setUserSettings(data);

    return data.recentFiles;
};

/**
 * Put the specific project on top of recent projects
 * @param projectName Project name to register
 * @param filePath Project file path to register
 * @returns Latest recent projects list
 */
export const registerRecentProject = async (projectName: string, filePath: string): Promise<IRecentFile[]> => {
    const data = await application.getUserSettings();
    data.recentFiles = [
        { filePath, projectName } as IRecentFile,
        ...data.recentFiles.filter((x: IRecentFile) => x.filePath !== filePath),
    ];
    application.setUserSettings(data);

    return data.recentFiles;
};
