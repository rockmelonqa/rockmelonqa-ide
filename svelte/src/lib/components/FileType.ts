import { StandardFileExtension } from 'rockmelonqa.common';

/** File system (OS) type */
export enum FileType {
    Env = 'Env',
    File = 'File', // generic file type
    Folder = 'Folder',
    Page = 'Page', // Page definition file
    RmProj = 'RmProj', // Rockmelon project file
    TCase = 'TCase', // Test case file
    TRoutine = 'TRoutine', // Test routine file
    TSuite = 'TSuite', // Test suite file
}

/**
 * Determine file type from file path (based on file extension)
 * @param fileName  File (OS) path or name
 * @returns FileType
 */
export const getFileType = (fileName: string): FileType => {
    const lastIndex = fileName.lastIndexOf('.');
    const ext = lastIndex < 0 ? '' : fileName.substring(lastIndex).toLowerCase();
    switch (ext) {
        case StandardFileExtension.Page:
            return FileType.Page;
        case StandardFileExtension.Env:
            return FileType.Env;
        case StandardFileExtension.Project:
            return FileType.RmProj;
        case StandardFileExtension.TestCase:
            return FileType.TCase;
        case StandardFileExtension.TestRoutine:
            return FileType.TRoutine;
        case StandardFileExtension.TestSuite:
            return FileType.TSuite;
        default:
            return FileType.File;
    }
};
