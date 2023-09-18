import { LocalCache } from "$lib/utils/LocalCache";
import type { ComponentType, SvelteComponentTyped } from "svelte";

/** Grid config */
export type GridConfig = {
    /** Grid type / name to be rendered */
    gridType: string;

    /** Column options */
    columns: ColumnOptions[];
};

/** Column options */
export type ColumnOptions = {
    /** Size of the column in percentage */
    size: number;

    /** Title of the column */
    title: string;
};

export type ButtonOptions = {
    label: string;

    icon: ComponentType<SvelteComponentTyped>;

    /** index: list data row index */
    action: (index: number) => void;

    visible: boolean;
};

export const DynamicGridSizeCache = {
    get(gridType: string): number[] | undefined {
        const key = cacheKey.replace("{name}", gridType);
        return (LocalCache.get(key) as number[]) || undefined;
    },

    set(gridType: string, sizes: number[]): void {
        const key = cacheKey.replace("{name}", gridType);
        LocalCache.set(key, sizes, Number.MAX_SAFE_INTEGER);
    },
};
const cacheKey = "dynamic-grid-{name}-size";

export const calCommentColSpan = (numOfColumns: number): number => {
    // *2: columns and their gutter

    // -3:
    // - one is its own gutter
    // - action column
    // - action column's gutter

    return numOfColumns * 2 - 3;
};
