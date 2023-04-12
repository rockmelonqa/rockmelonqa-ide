/*
 * Tracks the mode of a form to help
 *   - show/hide enable/disable controls
 *   - perform actions
 */

import { writable } from 'svelte/store';

/**
 * FormMode States
 */
export enum FormModeState {
    /**
     * Getting data from the server
     */
    Load = 'Load',

    /**
     * Add mode - add a new record
     */
    Add = 'Add',

    /**
     * Edit mode - change details
     */
    Edit = 'Edit',

    /**
     * View mode - readonly page
     */
    View = 'View',

    /**
     * Is doing some work like calling the server to save data
     */
    Process = 'Process',
}

/**
 * Current UI action state of the form
 */
export interface IFormMode {
    /** Current mode */
    currentMode: FormModeState;

    /** Previous form mode ... used in revert */
    previousMode?: IFormMode;

    /** Form is calling the server to retrieve and download data */
    isLoading: () => boolean;

    /** Form is expecting the user to enter data to create a NEW record */
    isAdding: () => boolean;

    /** Form is expecting the user to view data from an existing record */
    isViewing: () => boolean;

    /** Form is expecting the user to enter changes to data from an existing record */
    isEditing: () => boolean;

    /** The user has initiated an action and the form is processing that action - e.g. save, delete */
    isProcessing: () => boolean;

    /** Description of the processing action taken */
    description: string;
}

/**
 * Actions for the Form Mode reducer function
 */
export enum FormModeActionType {
    /**
     * Getting data from the server
     */
    Load = 'Load',

    /**
     * Add mode - add a new record
     */
    Add = 'Add',

    /**
     * Edit mode - change details
     */
    Edit = 'Edit',

    /**
     * View mode - readonly page
     */
    View = 'View',

    /**
     * Is doing some work like calling the server to save data
     */
    Process = 'Process',

    /**
     * Revert to previous form mode
     */
    Revert = 'Revert',
}

export type FormModeAction =
    | { type: FormModeActionType.Load; description?: string }
    | { type: FormModeActionType.Add }
    | { type: FormModeActionType.Edit }
    | { type: FormModeActionType.View }
    | { type: FormModeActionType.Process; description?: string }
    | { type: FormModeActionType.Revert };

/**
 * Initial blank state used for hook initialization
 */
export class FormMode implements IFormMode {
    currentMode: FormModeState;
    previousMode?: IFormMode;
    description: string;

    constructor(newMode: FormModeState, previousMode?: IFormMode, description = '') {
        this.currentMode = newMode;
        this.previousMode = previousMode;
        this.description = description;
    }

    isLoading() {
        return this.currentMode === FormModeState.Load;
    }
    isAdding() {
        return this.currentMode === FormModeState.Add;
    }
    isViewing() {
        return this.currentMode === FormModeState.View;
    }
    isEditing() {
        return this.currentMode === FormModeState.Edit;
    }
    isProcessing() {
        return this.currentMode === FormModeState.Process;
    }
}

function formModeReducer(state: IFormMode, action: FormModeAction): IFormMode {
    switch (action.type) {
        case FormModeActionType.Load:
            return new FormMode(FormModeState.Load, state, action.description ?? '');
        case FormModeActionType.Add:
            return new FormMode(FormModeState.Add, state);
        case FormModeActionType.Edit:
            return new FormMode(FormModeState.Edit, state);
        case FormModeActionType.View:
            return new FormMode(FormModeState.View, state);
        case FormModeActionType.Process:
            return new FormMode(FormModeState.Process, state, action.description ?? '');
        case FormModeActionType.Revert:
            if (state.previousMode) {
                return new FormMode(
                    state.previousMode.currentMode,
                    state.previousMode.previousMode,
                    state.previousMode.description
                );
            }
            return state;
        default:
            throw new Error('Unknown action type');
    }
}

/**
 * Form Mode Store
 *
 * @returns Object with the following properties:
 *  - formMode: IDictionary of errors for all fields. Each property contains the error message or `null` if no error
 *
 *  - formModeDispatch: dispatcher for actions
 */
export const createFormModeContext = (intialFormMode: FormModeState, intialFormDescription?: string) => {
    const { update, subscribe } = writable(new FormMode(intialFormMode, undefined, intialFormDescription));

    function dispatch(action: FormModeAction) {
        update((state) => formModeReducer(state, action));
    }

    return {
        value: { subscribe },
        dispatch,
    };
};
