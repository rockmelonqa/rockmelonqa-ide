import { fileSystem } from '$lib/ipc';
import * as lodash from 'lodash';
import { writable } from 'svelte/store';
import { FileType, getFileType } from '../FileType';

export class Node {
    static readonly PATH_SEPARATOR = '/';

    name = ''; /** Node label */
    parent?: Node; /** Undefined or null for root node */
    type: FileType = FileType.File;

    hasChildren = false; /** Determine whether folder has children or not */
    children?: Node[] /** Undefined to support lazy loading */;

    expanded = false; /** Represent collapse or expanding state */
    editMode = false; /** True, to enter 'rename' mode */

    constructor(init?: Partial<Node>) {
        Object.assign(this, init);
    }

    setChildren(children: Node[]) {
        children.forEach((node) => (node.parent = this));

        this.children = children;
        this.hasChildren = this.children.length > 0;
    }

    /**
     * To tree (node) path, build from root/ancestor/parent/node name
     */
    toTreePath(): string {
        const treePath = this.parent ? `${this.parent.toTreePath()}${Node.PATH_SEPARATOR}${this.name}` : this.name;
        return treePath;
    }

    /**
     * Find node from given node path
     * @param treePath node (tree) path
     * @returns Found node
     */
    findNodeByPath(treePath: string): Node | null {
        const currentTreePath = this.toTreePath();
        if (!treePath.startsWith(currentTreePath)) {
            return null;
        }

        // Search from current node ('this') only
        // Let's trim its parent path
        // - givenPath (parameter):     'root/parent/here/demo'
        // - searchFrom (this):         'root/parent/here'
        // - let's trim the parent path 'root/parent'
        // - --> traverse from          'here'
        const { parentPath } = Node.extractPath(currentTreePath);
        const pathToTraverse = treePath.substring(parentPath.length);

        // Split by separator and ignore empty items
        // Revese array to pop (pick from end) later
        const pathSegments = pathToTraverse.split(Node.PATH_SEPARATOR).filter(Boolean).reverse();
        let children: Node[] = [this];
        let candidate: Node | null = null;
        while (pathSegments.length > 0) {
            const nameToFind = pathSegments.pop();
            candidate = children.find((n) => n.name == nameToFind) ?? null;

            if (!candidate) {
                break;
            }

            children = candidate.children ?? [];
        }

        return candidate;
    }

    /**
     * Find node from give source, by give node (tree) path
     * @param nodes List of nodes to lookup from
     * @param treePath node (tree) path to lookup
     * @returns Found node
     */
    static findNodeByPath(nodes: Node[], treePath: string): Node | null {
        for (const node of nodes) {
            const found = node.findNodeByPath(treePath);
            if (found) {
                return found;
            }
        }

        return null;
    }

    static sort(nodes: Node[]): Node[] {
        // sort by folder-file, then name alphabet
        return lodash.sortBy(
            nodes,
            function (f) {
                return f.type != FileType.Folder;
            },
            'name'
        );
    }

    /**
     * Build node path from given parent (node) path and node name
     */
    static combinePath = (parentPath: string, nodeName: string) => {
        return combinePath([parentPath, nodeName], Node.PATH_SEPARATOR);
    };

    /**
     * Extract given path into 2 parts: parent path and its name
     */
    static extractPath = (treePath: string): { parentPath: string; name: string } => {
        return extractPath(treePath, Node.PATH_SEPARATOR);
    };
}

/**
 * Build the list of nodes, represents children of given folder path
 * @param folderPath Full folder (OS) path
 * @returns List of nodes
 */
export const buildChildrenNodes = async (folderPath: string): Promise<Node[]> => {
    const walkFolders = await fileSystem.walkFolder(folderPath);
    return walkFolders
        .filter((item) => item.error == null)
        .map((item) => {
            return new Node({
                name: item.name,
                hasChildren: item.isDir ? item.hasChildren : false,
                type: item.isDir ? FileType.Folder : getFileType(item.path),
            });
        });
};

/**
 * Given file-system-path, remove project-folder-path to get tree-path
 * @param fileSystemPath File system (OS) path
 * @param projectFolderPath Project root folder path
 * @param fileSystemPathSeparator File System (OS) path separator (uiContext.pathSeparator)
 * @return null, if cannot parse to tree path
 */
export const toTreePath = (
    fileSystemPath: string,
    projectFolderPath: string,
    fileSystemPathSeparator: string
): string | null => {
    if (!fileSystemPath.startsWith(projectFolderPath)) {
        return null;
    }

    const treePath = fileSystemPath.substring((projectFolderPath + fileSystemPathSeparator).length);
    return fileSystemPathSeparator != Node.PATH_SEPARATOR
        ? treePath.replaceAll(fileSystemPathSeparator, Node.PATH_SEPARATOR)
        : treePath;
};

/**
 * Given project-folder-path and node-path, combine to get whole file-system-path
 * @param treePath Should be 'node.toTreePath()'
 * @param projectFolderPath Should be '$appState.projectFile.folderPath'
 * @param fileSystemPathSeparator File System (OS) path separator (uiContext.pathSeparator)
 * @returns Full file system path
 */
export const toFileSystemPath = (
    treePath: string,
    projectFolderPath: string,
    fileSystemPathSeparator: string
): string => {
    return (
        projectFolderPath +
        fileSystemPathSeparator +
        (fileSystemPathSeparator != Node.PATH_SEPARATOR
            ? treePath.replaceAll(Node.PATH_SEPARATOR, fileSystemPathSeparator)
            : treePath)
    );
};

/** Combine multiple path segments */
export const combinePath = (paths: string[], pathSeparator: string) => {
    return paths.join(pathSeparator);
};

/**
 * Extract given path into 2 parts: parent path and its name
 */
export const extractPath = (path: string, pathSeparator: string): { parentPath: string; name: string } => {
    const lastIndex = path.lastIndexOf(pathSeparator);
    if (lastIndex < 0) {
        return {
            parentPath: '',
            name: path,
        };
    }

    return {
        parentPath: path.substring(0, lastIndex),
        name: path.substring(lastIndex + 1),
    };
};

/**
 * Create a svelte store, to track tree path of the node which displays context-menu
 */
const createShowMenuAt = () => {
    const { subscribe, set } = writable('');
    return {
        subscribe,
        set: (value: string) => set(value),
        reset: () => set(''),
    };
};
export const showMenuAt = createShowMenuAt();
