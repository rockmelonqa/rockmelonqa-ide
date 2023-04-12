/**
 * Field definitions
 */

import type { IUiContext } from '$lib/context/UiContext';
import type currency from 'currency.js';

/**
 * Specified an object where the properties can be accessed by an indexer
 * https://stackoverflow.com/questions/58458308/what-does-a-typescript-index-signature-actually-mean
 */
export interface IDictionary {
    [name: string]: any;
}

export enum FieldDataType {
    /** String */
    Text = 'Text',

    /** RichText */
    RichText = 'RichText',

    /** data value = Key of selected option */
    Dropdown = 'DropDown',

    /** data value = "YYYY-MM-DD" */
    Date = 'Date',

    /** Time of day = "12:00 AM" */
    Time = 'Time',

    /** data value = "YYYY-MM-DDTHH:MM:SSZ" */
    DateTime = 'DateTime',

    /** data value = "1,234" */
    Integer = 'Integer',

    /** data value = "1,234.5678" */
    Float = 'Float',

    /** data value = true | false */
    Boolean = 'Boolean',

    /** data value = true | false | null | undefined */
    NullableBoolean = 'NullableBoolean',

    /** data value = number (int) | null */
    NullableFloat = 'NullableFloat',

    /** data value = number (float)| null */
    NullableInteger = 'NullableInteger',

    /** data value = [{ key: value }] */
    List = 'List',
}

export type OnIsRequiredFunction = (fieldValues: IDictionary) => boolean;

/**
 * Determines if a field is required or not
 * @param fieldValues Field values to check against. Allows for cross field requirement dependancies
 * @param isRequired flag or func to determine if field is required or not
 * @returns True if a field is required
 */
export function isFieldRequired(fieldValues: IDictionary, isRequired?: boolean | OnIsRequiredFunction): boolean {
    if (isRequired === undefined) {
        return false;
    }

    if (typeof isRequired === 'boolean') {
        return isRequired;
    } else {
        const isRequiredFunc: OnIsRequiredFunction = isRequired;
        return isRequiredFunc(fieldValues);
    }
}

/**
 * Determines the label for a field based on this order:
 * 1. Label property on a control
 * 2. Lookup of String Resource
 * 3. Label in the fieldDef
 *
 * @param label Label on the field
 * @param fieldDef Field definition
 * @param formContext Form context to get the form name
 * @param uiContext UI context for string res look up
 * @returns Label for the field
 */
export function getFieldLabel(
    label: string,
    formName: string,
    fieldName: string,
    fieldDef: IBaseFieldDef,
    uiContext: IUiContext
): string {
    if (label) {
        return label;
    }

    if (fieldDef.label) {
        // Lookup label and if not found, use it
        const sr = uiContext.str(fieldDef.label);
        return sr;
    } else {
        // If not label on the field, then lookup using formName.fieldName
        const key = `${formName}.${fieldName}`;
        const sr2 = uiContext.str(key);
        return sr2 && sr2 === key ? '' : sr2;
    }
}

/**
 * Determines the placeholder for a field based on this order:
 * 1. Placeholder property on a control
 * 2. Lookup of String Resource
 * 3. Placeholder in the fieldDef
 *
 * @param placeholder Label on the field
 * @param fieldDef Field definition
 * @param formContext Form context to get the form name
 * @param uiContext UI context for string res look up
 * @returns Label for the field
 */
export function getFieldPlaceholder(
    placeholder: string,
    formName: string,
    fieldName: string,
    fieldDef: IBaseFieldDef,
    uiContext: IUiContext
): string {
    if (placeholder) {
        return placeholder;
    }

    if (fieldDef.placeholder) {
        // Lookup placeholder and if not found, use it
        const sr = uiContext.str(fieldDef.placeholder);
        return sr;
    } else {
        // If not placeholder on the field, then lookup using formName.fieldName
        const key = `${formName}.${fieldName}_placeholder`;
        const sr2 = uiContext.str(key);
        return sr2 && sr2 === key ? '' : sr2;
    }
}

interface IBaseFieldDef {
    /** Data type of the field */
    dataType: FieldDataType;

    /** Path to load form model */
    dataPath?: string;

    /** Label to display on the page */
    label?: string;

    /** Placeholder to display on the page */
    placeholder?: string;

    /** Initial value if not values supplied in the model */
    initialValue?: any;

    /** Determines if this field is going to be serialized into the model or not */
    isReadOnly?: boolean;
}

interface IRequiredFieldDef {
    /** If field is required. Defaults to false. */
    isRequired?: boolean | OnIsRequiredFunction;

    /** Override error message to display if isRequired fails */
    isRequiredErrorMessage?: string;
}

/**
 * Rich text string data type
 */
export interface IRichTextFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.RichText;

    minLength?: number;
    minLengthErrorMessage?: string;

    maxLength?: number;
    maxLengthErrorMessage?: string;

    onValidate?: (
        fieldName: string,
        fieldValue: string,
        fieldValues: IDictionary,
        uiContext: IUiContext
    ) => string | null;
}

/**
 * Time of day string data type
 */
export interface ITimeFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.Time;

    pattern?: RegExp;
    patternErrorMessage?: string;

    onValidate?: (
        fieldName: string,
        fieldValue: Date,
        fieldValues: IDictionary,
        uiContext: IUiContext
    ) => string | null;
}

/**
 * Text string data type
 */
export interface ITextFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.Text;

    minLength?: number;
    minLengthErrorMessage?: string;

    maxLength?: number;
    maxLengthErrorMessage?: string;

    pattern?: RegExp;
    patternErrorMessage?: string;

    onValidate?: (
        fieldName: string,
        fieldValue: string,
        fieldValues: IDictionary,
        uiContext: IUiContext
    ) => string | null;
}

/**
 * Drop down (SELECT). Value is the key of the drop down.
 */
export interface IDropdownFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.Dropdown;

    /** Return field value as null when blank option (key = empty string) is selected, default is false */
    isNullWhenEmpty?: boolean;

    onValidate?: (
        fieldName: string,
        fieldValue: string,
        fieldValues: IDictionary,
        uiContext: IUiContext
    ) => string | null;
}

/**
 * Date without time. Data type of the value stored in the model is Date rather than string.
 */
export interface IDateFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.Date;

    /** luxon format used to display the date to the user. Defaults to the uiContext setting */
    format?: string;

    minDate?: Date;
    minDateErrorMessage?: string;

    maxDate?: Date;
    maxDateErrorMessage?: string;

    onValidate?: (
        fieldName: string,
        fieldValue: Date,
        fieldValues: IDictionary,
        uiContext: IUiContext
    ) => string | null;
}

/**
 * Date with time.
 *
 * This data type is treated as a string in the field values. During validation, it is parsed into a Date for onValidate
 */
export interface IDateTimeFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.DateTime;

    /** luxon format used to display the date to the user. Defaults to the uiContext setting */
    format?: string;

    minDateTime?: Date;
    minDateTimeErrorMessage?: string;

    maxDateTime?: Date;
    maxDateTimeErrorMessage?: string;

    onValidate?: (
        fieldName: string,
        fieldValue: Date,
        fieldValues: IDictionary,
        uiContext: IUiContext
    ) => string | null;
}

/**
 * Integer
 *
 * This data type is treated as a string in the field values. During validation, it is parsed into a number for onValidate
 */
export interface IIntegerFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.Integer;

    /** currency.js format */
    format?: currency.Options;

    /** Blank if zero, default is false */
    isBlankWhenZero?: boolean;

    min?: number;
    minErrorMessage?: string;

    max?: number;
    maxErrorMessage?: string;

    onValidate?: (
        fieldName: string,
        fieldValue: number,
        fieldValues: IDictionary,
        uiContext: IUiContext
    ) => string | null;
}
/**
 * Nullable Integer
 *
 */
export interface INullableIntegerFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.NullableInteger;

    /** currency.js format */
    format?: currency.Options;

    /** Blank if zero, default is false */
    isBlankWhenZero?: boolean;

    min?: number;
    minErrorMessage?: string;

    max?: number;
    maxErrorMessage?: string;

    onValidate?: (
        fieldName: string,
        fieldValue: number | null,
        fieldValues: IDictionary,
        uiContext: IUiContext
    ) => string | null;
}

/**
 * Float
 *
 * This data type is treated as a string in the field values. During validation, it is parsed into a number for onValidate
 */
export interface IFloatFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.Float;

    /** currency.js format */
    format?: currency.Options;

    /** Blank if zero, default is false */
    isBlankWhenZero?: boolean;

    min?: number;
    minErrorMessage?: string;

    max?: number;
    maxErrorMessage?: string;

    onValidate?: (
        fieldName: string,
        fieldValue: number,
        fieldValues: IDictionary,
        uiContext: IUiContext
    ) => string | null;
}

/**
 * Nullable Float
 *
 */
export interface INullableFloatFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.NullableFloat;

    /** currency.js format */
    format?: currency.Options;

    /** Blank if zero, default is false */
    isBlankWhenZero?: boolean;

    min?: number;
    minErrorMessage?: string;

    max?: number;
    maxErrorMessage?: string;

    onValidate?: (
        fieldName: string,
        fieldValue: number | null,
        fieldValues: IDictionary,
        uiContext: IUiContext
    ) => string | null;
}

/**
 * Boolean (true | false)
 *
 * Data type of the value stored in the model is boolean.
 */
export interface ICheckFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.Boolean | FieldDataType.NullableBoolean;
    onValidate?: (
        fieldName: string,
        fieldValue: boolean,
        fieldValues: IDictionary,
        uiContext: IUiContext
    ) => string | null;
}

/**
 * Nullable Boolean (true | false | null | undefined )
 *
 * Data type of the value stored in the model is boolean | null | undefined
 */
export interface IBooleanDropdownFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.Boolean | FieldDataType.NullableBoolean;
    onValidate?: (fieldName: string, fieldValue: any, fieldValues: IDictionary, uiContext: IUiContext) => string | null;
}

/**
 * List of fields
 */
export interface IListFieldDef extends IBaseFieldDef, IRequiredFieldDef {
    dataType: FieldDataType.List;
    fieldDefs: IFieldDefs;
}

/**
 * Field definition
 */
export type IFieldDef =
    | ITextFieldDef
    | IRichTextFieldDef
    | IDropdownFieldDef
    | IDateFieldDef
    | IDateTimeFieldDef
    | IIntegerFieldDef
    | INullableIntegerFieldDef
    | IFloatFieldDef
    | INullableFloatFieldDef
    | ICheckFieldDef
    | IBooleanDropdownFieldDef
    | IListFieldDef;

/**
 * List of fields
 */
export interface IFieldDefs {
    [name: string]: IFieldDef;
}

export const IdFieldFormat = {
    symbol: '',
    separator: '',
    decimal: '.',
    precision: 0,
};
