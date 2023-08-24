/** Grid config */
export type GridConfig = {
    /** Type of collection that the grid is being used to render */
    gridType: string;
    /** Collection of column options */
    columns: ColumnOptions[];
};

/** Column options */
export type ColumnOptions = {
    /** Size of the column in percentage */
    defaultSizePercentage: number;
    /** Title of the column */
    title: string;
};

type CacheSizeMap = Map<string, number[]>;

export const DynamicGridSizeCache = {
    getByCollectionType(collectionType: string): number[] | undefined {
        if (localStorage.DynamicGridSizeCache) {
            const cache = this.readLocalStorage();
            if (cache.has(collectionType)) {
                return cache.get(collectionType);
            }
            return undefined;
        }
        return undefined;
    },

    setByCollectionType(collectionType: string, sizes: number[]): void {
        if (localStorage.DynamicGridSizeCache) {
            const cache = this.readLocalStorage();
            cache.set(collectionType, sizes);
            this.writeLocalStorage(cache);
            return;
        }

        const cache = new Map<string, number[]>();
        cache.set(collectionType, sizes);
        this.writeLocalStorage(cache);
        return;
    },

    readLocalStorage() {
        const obj = JSON.parse(localStorage.DynamicGridSizeCache);
        return new Map(Object.entries(obj)) as Map<string, number[]>;
    },
    writeLocalStorage(map: CacheSizeMap) {
        const obj = Object.fromEntries(map);
        localStorage.DynamicGridSizeCache = JSON.stringify(obj);
    },
};
