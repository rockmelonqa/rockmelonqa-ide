import * as fs from "fs";
import fse from "fs-extra";
import path from "path";
import { IFileSystemInfo } from "rockmelonqa.common";

/**
 * Determine whether file or folder exist or not
 * @param filePath
 * @returns
 */
export async function checkExists(filePath: string): Promise<boolean> {
    try {
        await fs.promises.access(filePath);
        return true;
    } catch (error) {
        return false;
    }
}

export function checkExistsSync(filePath: string): boolean {
    return fs.existsSync(filePath);
}

/**
 * Create new folder
 */
export async function createFoler(folderPath: string): Promise<void> {
    let folderExists = await checkExists(folderPath);
    if (!folderExists) {
        try {
            await fs.promises.mkdir(folderPath);
        } catch (error) {
            console.log("CANNOT create folder:", folderPath);
            console.error(error);
            throw error;
        }
    }
}

/**
 * Delete file or folder at given path
 */
export async function deleteFileSystem(fullPath: string): Promise<void> {
    try {
        await fs.promises.rm(fullPath, { recursive: true, force: true });
    } catch (error) {
        console.log("CANNOT delete file:", fullPath);
        console.error(error);
        throw error;
    }
}

/** Generates cloned file name when pasting the same file at nth time */
const genClonedFileNameAtNth = (srcFileNameWithoutExt: string, ext: string, n: number) => {
    if (n === 1) {
        return `${srcFileNameWithoutExt} - Copy${ext}`;
    }
    return `${srcFileNameWithoutExt} - Copy (${n})${ext}`;
};

/**
 * Copies file at given path and paste it the same folder, i.e clones it.
 */
export async function cloneFileSystem(fullPath: string): Promise<void> {
    try {
        const srcFileNameWithoutExt = path.parse(fullPath).name;
        const srcFileExt = path.extname(fullPath);
        const srcDir = path.dirname(fullPath);

        // Use Windows Explorer file copy/paste naming pattern:
        // EX:
        // - Src file name:             Document.txt
        // - First copied file name:    Document - Copy.txt
        // - Second copied file name:   Document - Copy (2).txt
        // - etc...

        let foundExistingClonedFile = false;
        let pastingTime = 1;
        while (!foundExistingClonedFile) {
            let newClonedFileName = genClonedFileNameAtNth(srcFileNameWithoutExt, srcFileExt, pastingTime);
            let newClonedFilePath = path.join(srcDir, newClonedFileName);
            let existing = fs.existsSync(newClonedFilePath);
            if (!existing) {
                // Create the file
                const newFileName = await fse.copy(fullPath, newClonedFilePath);
                foundExistingClonedFile = true;
                return;
            }
            pastingTime += 1;
        }
    } catch (error) {
        console.log("CANNOT clone file:", fullPath);
        console.error(error);
        throw error;
    }
}

/**
 * Get folder info.
 * Always determine 'hasChildren', but optionally load 'children'
 */
export async function getFolder(folderPath: string, includeChildren?: boolean): Promise<IFileSystemInfo | null> {
    const stats = await fs.promises.lstat(folderPath);
    if (!stats.isDirectory()) {
        return null;
    }

    let children: IFileSystemInfo[] | undefined;
    let hasChildren: boolean;

    if (includeChildren) {
        children = await walkFolder(folderPath);
        hasChildren = children.length > 0;
    } else {
        hasChildren = !(await isEmptyFolder(folderPath));
    }

    return {
        path: folderPath,
        name: path.basename(folderPath),
        isDir: true,
        hasChildren,
        children,
    } as IFileSystemInfo;
}

/**
 * Determine folder is empty or not
 * @param folderPath
 * @returns
 */
export async function isEmptyFolder(folderPath: string): Promise<boolean> {
    try {
        const folder = await fs.promises.opendir(folderPath);
        const entry = await folder.read();
        await folder.close();

        return entry === null;
    } catch (error) {
        return false;
    }
}

/**
 * Read text file
 * @param filePath
 * @returns
 */
export async function readFile(filePath: string): Promise<string> {
    try {
        return await fs.promises.readFile(filePath, "utf-8");
    } catch (error) {
        console.log("CANNOT read file:", filePath);
        console.error(error);
        throw error;
    }
}

/**
 * Rename file system
 */
export async function rename(oldPath: string, newPath: string): Promise<void> {
    if (await checkExists(newPath)) {
        throw new Error(`'${newPath}' already exists`);
    }

    try {
        await fs.promises.rename(oldPath, newPath);
    } catch (error) {
        console.log(`CANNOT rename from '${oldPath}' to '${newPath}'`);
        console.error(error);
        throw error;
    }
}

/**
 * Write text file
 * @param filePath
 * @param fileContent
 */
export async function writeFile(filePath: string, fileContent: string): Promise<void> {
    try {
        await fs.promises.writeFile(filePath, fileContent);
    } catch (error) {
        console.log("CANNOT write file:", filePath);
        console.error(error);
        throw error;
    }
}

/**
 * Get children file system (folder/file) of given path
 */
export async function walkFolder(folderPath: string): Promise<IFileSystemInfo[]> {
    try {
        let results: IFileSystemInfo[] = [];

        const files = await fs.promises.readdir(folderPath);
        for (const file of files) {
            const pathToFile = path.join(folderPath, file);
            try {
                const stat = await fs.promises.stat(pathToFile);
                const isDirectory = stat.isDirectory();

                results.push({
                    path: pathToFile,
                    name: file,
                    isDir: isDirectory,
                    hasChildren: isDirectory ? !(await isEmptyFolder(pathToFile)) : false,
                } as IFileSystemInfo);
            } catch (err) {
                results.push({
                    path: pathToFile,
                    name: file,
                    error: err,
                } as IFileSystemInfo);
            }
        }

        return results;
    } catch (error) {
        console.log("CANNOT walkFolder:", folderPath);
        console.error(error);
        throw error;
    }
}
