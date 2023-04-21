import Store from 'electron-store';

const DEFAULT_WINDOW_SIZE_KEY = 'defaultWindowSize';
const MAXIMIZE = 'maximize';
const MINIMIZE = 'minimize';

type StoreType = {
    defaultWindowSize: string;
}
const getStore = () => {
    return new Store<StoreType>({
        defaults: {
            defaultWindowSize: MINIMIZE
        }
    });
}

/**
 * Check the current window size is maximize
 * @returns true window size == maximize
 */
export const isWindowMaximize = () : boolean => {
    const store = getStore();
    return store.get(DEFAULT_WINDOW_SIZE_KEY) == MAXIMIZE;
}

/**
 * Set value Maximize to electron-store
 */
export const setWindowMaximize = () => {
    const store = getStore();
    store.set(DEFAULT_WINDOW_SIZE_KEY, MAXIMIZE);
}
/**
 * Set value Minimize to electron-store
 */
export const setWindowMinimize = () => {
    const store = getStore();
    store.set(DEFAULT_WINDOW_SIZE_KEY, MINIMIZE);
}