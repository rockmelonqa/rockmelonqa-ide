import type { Action } from 'rockmelonqa.common';
import { DefaultApiKey } from './shared';

const nameAPI = 'window';

const getApi = (apiKey?: string) => {
    return globalThis[(apiKey || DefaultApiKey) as keyof typeof globalThis][nameAPI];
};

const onShow = (fn: (data: unknown) => void, options?: { apiKey?: string }): Action | undefined => {
    return getApi(options?.apiKey).on('show', fn);
};

export const window = {
    onShow,
};
