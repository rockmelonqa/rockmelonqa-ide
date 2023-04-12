import type { ComponentType, SvelteComponentTyped } from 'svelte';

export interface IGenericTab<TData> {
    /** Identifier of tab item, example: FileExplorer node path */
    id: string;
    title: string;
    tooltip?: string;
    content: ITabContent<TData>;
    isDirty?: boolean;
}

export interface ITabContent<TData> {
    /** Svelte component to display at Tab Content area */
    component: ComponentType<SvelteComponentTyped>;
    data: TData;
}

export type ITab = IGenericTab<any>;
