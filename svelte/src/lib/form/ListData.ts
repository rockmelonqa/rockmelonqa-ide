/**
 * List data context.
 */
import type { IUiContext } from '$lib/context/UiContext';
import { writable, type Readable } from 'svelte/store';

import type { IDictionary } from './FieldDef';
import type { IListDef } from './ListDef';

export interface IListData {
    listDef: IListDef;
    items: IDictionary[];
    hasMoreItems: boolean;
}

/**
 * Actions for the form data reducer function
 */
export enum ListDataActionType {
    /** Set data  */
    SetItems = 'SetItems',
    /** Clear all data */
    ClearItems = 'ClearItems',
    /** Append the new data to the existing one */
    AppendItems = 'AppendItems',
    /** Insert the new data to the existing one at index */
    InsertItem = 'InsertItem',
    /** Update specific item in the list data */
    UpdateItem = 'UpdateItem',
    /** Remove Item out of list */
    RemoveItem = 'RemoveItem',
    SwapItems = 'SwapItems',
}

export type ListDataAction =
    | { type: ListDataActionType.SetItems; items: IDictionary[]; hasMoreItems: boolean }
    | { type: ListDataActionType.ClearItems }
    | { type: ListDataActionType.AppendItems; items: IDictionary[]; hasMoreItems: boolean }
    | { type: ListDataActionType.InsertItem; item: IDictionary; index: number; }
    | { type: ListDataActionType.UpdateItem; index: number; item: IDictionary }
    | { type: ListDataActionType.RemoveItem; index: number }
    | { type: ListDataActionType.SwapItems; indexA: number; indexB: number };

function listDataReducer(state: IListData, action: ListDataAction) {
    switch (action.type) {
        case ListDataActionType.SetItems:
            return { ...state, items: action.items, hasMoreItems: action.hasMoreItems };
        case ListDataActionType.ClearItems:
            return { ...state, items: [], hasMoreItems: false };
        case ListDataActionType.AppendItems:
            return { ...state, items: state.items.concat(action.items), hasMoreItems: action.hasMoreItems };
        case ListDataActionType.InsertItem: {
            const newItems = [...state.items];
            newItems.splice(action.index, 0, action.item);
            return { ...state, items: newItems };
        }
        case ListDataActionType.UpdateItem: {
            const newItems = [...state.items];
            newItems[action.index] = action.item;
            return { ...state, items: newItems };
        }
        case ListDataActionType.RemoveItem: {
            const newItems = [...state.items];
            newItems.splice(action.index, 1);
            return { ...state, items: newItems };
        }
        case ListDataActionType.SwapItems: {
            const newItems = [...state.items];
            newItems[action.indexA] = state.items[action.indexB];
            newItems[action.indexB] = state.items[action.indexA];
            return { ...state, items: newItems };
        }
        default:
            throw new Error('Unknown action type');
    }
}

export interface IListDataContext {
    /** Current form mode */
    value: Readable<IListData>;

    /** Dispatcher for changes in data */
    dispatch: (action: ListDataAction) => void;
}

/**
 * Create a new list data context
 *
 * @param formDef Form Data configuration that details the fields, mapping and validation rules
 *
 * @returns Object with the following properties:
 *  - formData: State
 *  - formDataDispatch(): Dispatcher function
 */
export const createListDataContext = (listDef: IListDef, uiContext: IUiContext): IListDataContext => {
    const blankListData: IListData = {
        listDef,
        items: [],
        hasMoreItems: false,
    };

    const { update, subscribe } = writable(blankListData);

    function dispatch(action: ListDataAction) {
        update((state) => listDataReducer(state, action));
    }

    return {
        value: { subscribe },
        dispatch,
    };
};
