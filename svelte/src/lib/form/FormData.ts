/* eslint-disable no-case-declarations */
/**
 * Form Data Context to manage form data, validation and error messages
 */

import type { IUiContext } from '$lib/context/UiContext';
import { writable } from 'svelte/store';
import { FieldDataType, type IDictionary } from './FieldDef';
import { FieldValidator } from './FieldValidator';
import type { IFormDef } from './FormDef';

/**
 * Current UI data state of the form
 */
export interface IFormData {
    /**
     * Value of each field
     *
     * {
     *    firstName: "Fred",
     *    lastName: ""
     * }
     */
    values: IDictionary;

    /**
     * Original data values to use to restore form when the user clicks Cancel
     */
    originalValues: IDictionary;

    /**
     * Error message for each field
     *
     * {
     *    firstName: "",                  // No error
     *    lastName: "Field is required"   // Error to show
     * }
     */
    errors: IDictionary;

    /**
     * Flag true/false for each field that user has entered and exited to trigger an `onBlur` event
     *
     * {
     *    firstName: true,   // User has entered and edited this field
     *    lastName: false    // User has not entered edited this field
     * }
     */
    editedFields: IDictionary;

    /**
     * Subset of errors the corresponding editedFields value for the field is `true`
     */
    errorsToShow: IDictionary;

    /**
     * `true` if errors contains zero error messages
     */
    isValid: boolean;

    /**
     * `true` if data has been changed from what was loaded
     */
    isChanged: boolean;

    /**
     * uiContext information used for formatting
     */
    uiContext: IUiContext;

    /**
     * Form definition
     */
    formDef: IFormDef;

    /**
     * If true, there will not be any cross field validation.  Only the changed field will be validated.
     * If false, all fields will be validated even if only 1 field is changed.
     *
     * Defaults to false.
     *
     * If it faster to set this to "true" if cross field validations are not required.
     */
    onlyValidateChangedFields: boolean;
}

function resolveInitialValue(initialValue: any, dataType: FieldDataType) {
    const isEmpty = initialValue == null || initialValue.length === 0;
    if (isEmpty) {
        if (dataType === FieldDataType.Boolean) {
            // Boolean data type is usually associated to checkbox,
            // so empty string ("") does not make sense. Let's use 'false' by default
            return false;
        }

        return '';
    } else {
        // If initialValue is not empty, just return
        return initialValue;
    }
}

/**
 * Actions for the form data reducer function
 */
export enum FormDataActionType {
    /**
     * Change the value of field(s).
     */
    SetValues = 'SetValues',

    /**
     * Show all errors by marking all fields as having been blurred by the user
     */
    ShowAllErrors = 'ShowAllErrors',

    /**
     * Don't show any errors by marking all fields as having been not been blurred by the user
     */
    HideAllErrors = 'HideAllErrors',

    /**
     * Validate all fields and show the errors
     */
    SetErrors = 'SetErrors',

    /**
     * Mark a field has having been blured - i.e. user moved out of the field
     */
    SetEditedField = 'SetEditedField',

    /**
     * Update the form string res to be used for label and error message lookups
     */
    Initialize = 'Initialize',

    /**
     * Load the values of the form. Assumes that the newValues passed in contains ALL fields.
     * Load is typically used when viewing or editing an existing record.
     *
     * Do NOT use when adding a record unless ALL fields are provided.  Use SetValues instead if
     * you wish to change a subset of fields during add mode; e.g. defaulting values.
     */
    Load = 'Load',

    /**
     * Restore the value of the form to what it was on load
     */
    Restore = 'Restore',
}

export type FormDataAction =
    | {
          type: FormDataActionType.Initialize;
          formDef: IFormDef;
          uiContext: IUiContext;
          onlyValidateChangedFields?: boolean;
      }
    | { type: FormDataActionType.SetValues; newValues: IDictionary }
    | { type: FormDataActionType.ShowAllErrors }
    | { type: FormDataActionType.HideAllErrors }
    | { type: FormDataActionType.SetErrors; newErrors: IDictionary }
    | { type: FormDataActionType.SetEditedField; fieldName: string }
    | { type: FormDataActionType.Load; newValues: IDictionary }
    | { type: FormDataActionType.Restore };

function formDataReducer(state: IFormData, action: FormDataAction): IFormData {
    switch (action.type) {
        case FormDataActionType.SetValues:
            const values = { ...state.values, ...action.newValues };

            let errors: IDictionary;
            if (state.onlyValidateChangedFields) {
                // Only validate the field names passed to us in the newValues array
                errors = new FieldValidator(state.uiContext).validateFields(
                    values,
                    state.formDef.fields,
                    Object.getOwnPropertyNames(action.newValues)
                );
            } else {
                // Validate all fields
                errors = new FieldValidator(state.uiContext).validateFields(values, state.formDef.fields);
            }

            // Calc is changed because some controls may fire events to set values on load
            const isChanged = state.isChanged ? true : getIsChanged(state.values, action.newValues);

            return {
                ...state,
                values,
                errors,
                errorsToShow: getErrorsToShow(errors, state.editedFields),
                isValid: getIsValid(errors),
                isChanged: isChanged,
            };

        case FormDataActionType.ShowAllErrors:
            const editedAll: IDictionary = { ...state.editedFields };
            for (const fieldName in editedAll) {
                editedAll[fieldName] = true;
            }
            return { ...state, editedFields: editedAll, errorsToShow: getErrorsToShow(state.errors, editedAll) };

        case FormDataActionType.HideAllErrors:
            const uneditedAll: IDictionary = { ...state.editedFields };
            for (const fieldName in uneditedAll) {
                uneditedAll[fieldName] = false;
            }
            return { ...state, editedFields: uneditedAll, errorsToShow: getErrorsToShow(state.errors, uneditedAll) };

        case FormDataActionType.SetErrors:
            return {
                ...state,
                errors: action.newErrors,
                errorsToShow: getErrorsToShow(action.newErrors, state.editedFields),
                isValid: getIsValid(action.newErrors),
            };

        case FormDataActionType.SetEditedField:
            const edited = { ...state.editedFields, [action.fieldName]: true };
            return { ...state, editedFields: edited, errorsToShow: getErrorsToShow(state.errors, edited) };

        case FormDataActionType.Initialize:
            const initialValues: IDictionary = {};
            const initialEdited: IDictionary = {};

            for (const fieldName in action.formDef.fields) {
                initialValues[fieldName] = resolveInitialValue(
                    action.formDef.fields[fieldName].initialValue,
                    action.formDef.fields[fieldName].dataType
                );
                initialEdited[fieldName] = false;
            }
            const initialErrors = new FieldValidator(action.uiContext).validateFields(
                initialValues,
                action.formDef.fields
            );

            return {
                values: initialValues,
                originalValues: initialValues,
                errors: initialErrors,
                editedFields: initialEdited,
                errorsToShow: getErrorsToShow(initialErrors, initialEdited),
                isValid: getIsValid(initialErrors),
                isChanged: false,
                uiContext: action.uiContext,
                formDef: action.formDef,
                onlyValidateChangedFields:
                    action.onlyValidateChangedFields === undefined ? false : action.onlyValidateChangedFields,
            };

        case FormDataActionType.Load:
            const loadEdited: IDictionary = {};
            for (const fieldName in state.formDef.fields) {
                loadEdited[fieldName] = false;
            }

            const loadErrors = new FieldValidator(state.uiContext).validateFields(
                action.newValues,
                state.formDef.fields
            );
            return {
                ...state,
                values: action.newValues,
                originalValues: action.newValues,
                errors: loadErrors,
                editedFields: loadEdited,
                errorsToShow: getErrorsToShow(loadErrors, loadEdited),
                isValid: getIsValid(loadErrors),
                isChanged: false,
            };

        case FormDataActionType.Restore:
            const restoreEdited: IDictionary = {};
            for (const fieldName in state.formDef.fields) {
                restoreEdited[fieldName] = false;
            }
            const restoreErrors = new FieldValidator(state.uiContext).validateFields(
                state.originalValues,
                state.formDef.fields
            );
            return {
                ...state,
                values: state.originalValues,
                errors: restoreErrors,
                editedFields: restoreEdited,
                errorsToShow: getErrorsToShow(restoreErrors, restoreEdited),
                isValid: getIsValid(restoreErrors),
                isChanged: false,
            };

        default:
            throw new Error('Unknown action type');
    }
}

/**
 * Extracts the errors of fields that the user has entered/existed for display to the user
 *
 * @param state form state
 * @returns Dictionary of errors for fields where blurred flag is set to true.
 */
function getErrorsToShow(errors: IDictionary, editedFields: IDictionary) {
    const blurredErrors: IDictionary = {};
    for (const fieldName in errors) {
        blurredErrors[fieldName] = editedFields[fieldName] ? errors[fieldName] : null;
    }
    return blurredErrors;
}

/**
 * Returns `true` if there are no error messages in error
 * @param errors Errors to check
 */
function getIsValid(errors: IDictionary) {
    return Object.values(errors).every((error) => error === null);
}

/**
 * Used to determine if any field have changed
 * @param currentValues Current data
 * @param newValues New data
 * @returns True if values have been changed
 */
function getIsChanged(currentValues: IDictionary, newValues: IDictionary): boolean {
    const fieldNames = Object.getOwnPropertyNames(newValues);

    for (const fieldName of fieldNames) {
        if (currentValues[fieldName] !== newValues[fieldName]) {
            return true;
        }
    }

    return false;
}

/**
 * Create a new form data context
 *
 * @param formDef Form Data configuration that details the fields, mapping and validation rules
 *
 * @returns Object with the following properties:
 *  - formData: State
 *  - formDataDispatch(): Dispatcher function
 */
export const createFormDataContext = (formDef: IFormDef, uiContext: IUiContext) => {
    const blankFormData: IFormData = {
        values: {},
        originalValues: {},
        errors: {},
        editedFields: {},
        errorsToShow: {},
        isValid: false,
        isChanged: false,
        uiContext,
        formDef,
        onlyValidateChangedFields: false,
    };

    const { update, subscribe } = writable(blankFormData);

    function dispatch(action: FormDataAction) {
        update((state) => formDataReducer(state, action));
    }

    return {
        value: { subscribe },
        dispatch,
    };
};
