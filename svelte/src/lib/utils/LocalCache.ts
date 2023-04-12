/**
 * Local cache with expiry timeout.  The data is persisted in localStorage so it can be used
 * by multiple tabs and also if the browser is restarted.
 */
export class LocalCache {
    /**
     * Adds or updates and item into the cache
     * @param key Unique id for the item
     * @param value Value to storage
     * @param expiryMilliseconds Number of milliseconds before expiry. Defauts to 30,000 or 30 seconds.
     */
    public static set(key: string, value: unknown, expiryMilliseconds = 30000) {
        const now = new Date();

        // `item` is an object which contains the original value
        // as well as the time when it's supposed to expire
        const item = {
            value: value,
            expiry: now.getTime() + expiryMilliseconds,
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    /**
     * Retrieves an item from cache if it has not expired
     * @param key Unique id of the item to get
     * @returns Item value from cache; or null if item expired or not found
     */
    public static get(key: string): unknown {
        const itemStr = localStorage.getItem(key);

        // if the item doesn't exist, return null
        if (!itemStr) {
            return null;
        }

        const item = JSON.parse(itemStr);
        const now = new Date();

        // compare the expiry time of the item with the current time
        if (now.getTime() > item.expiry) {
            // If the item is expired, delete the item from storage and return null
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    }
}
