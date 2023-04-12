import { browser } from '$app/environment';

export default () => {
    if (browser) {
        return window;
    }
    return undefined;
};
