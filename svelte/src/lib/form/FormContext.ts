import type { IUiContext } from '$lib/context/UiContext';
import type { Readable } from 'svelte/store';
import { createFormDataContext, FormDataActionType, type FormDataAction, type IFormData } from './FormData';
import type { IFormDef } from './FormDef';
import { createFormModeContext, FormModeState, type FormModeAction, type IFormMode } from './FormMode';

/**
 * Context containing form data and form mode to pass to each field for the UI
 */
export interface IFormContext {
    /** Name of this form used for prefixing HTML element id */
    formName: string;

    /** Current form mode */
    mode: Readable<IFormMode>;

    /** Dispatcher for changes in data */
    modeDispatch: (action: FormModeAction) => void;

    /** Current form mode */
    data: Readable<IFormData>;

    /** Dispatcher for changes in data */
    dataDispatch: (action: FormDataAction) => void;
}

/**
 * Creates a new form context.
 *
 * @param formName Unique name for the form. Will be used to prefix field ids.
 * @param formDef Form definition
 * @param uiContext UI Context
 * @param intialFormMode Intial form start mode
 * @param intialFormModeDescription string to describe the mode
 * @param onlyValidateChangedFields Flag to indicate if we want to validate all fields or just the changed fields (which is faster)
 */
export function createFormContext(
    formName: string,
    formDef: IFormDef,
    uiContext: IUiContext,
    intialFormMode: FormModeState = FormModeState.Load,
    intialFormModeDescription = '',
    onlyValidateChangedFields = false
): IFormContext {
    const mode = createFormModeContext(intialFormMode, intialFormModeDescription);

    const data = createFormDataContext(formDef, uiContext);
    data.dispatch({
        type: FormDataActionType.Initialize,
        formDef,
        uiContext,
        onlyValidateChangedFields,
    });

    return {
        formName,
        mode: mode.value,
        modeDispatch: mode.dispatch,
        data: data.value,
        dataDispatch: data.dispatch,
    };
}

/**
 * Key used to get form context
 */
export const formContextKey = Symbol();
