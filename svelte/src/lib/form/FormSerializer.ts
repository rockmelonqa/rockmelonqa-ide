/* eslint-disable no-debugger */
import type { IUiContext } from '$lib/context/UiContext';
import { UiParserFormatter } from '$lib/context/UiParserFormatter';
import * as lodash from 'lodash';
import { FieldDataType, type IDictionary, type IFieldDefs, type INullableFloatFieldDef } from './FieldDef';

/**
 * Serialize and Deserialze fields on a form to and from JSON model object
 */
export class FormSerializer {
    private uiContext: IUiContext;
    private parserFormatter: UiParserFormatter;

    /**
     * Defaults to the browser's current settings
     *
     * @param locale Rm UI locale
     */
    constructor(uiContext: IUiContext) {
        this.uiContext = uiContext;
        this.parserFormatter = new UiParserFormatter(uiContext);
    }

    /**
     * Loads data from data model object into field values
     *
     * @param dataModel model object to store values
     * @param fieldDefs Field definitions
     * @returns field values in a object dictionary
     */
    deserialize = (dataModel: any, fieldDefs: IFieldDefs): IDictionary => {
        const fieldValues: IDictionary = {};

        for (const fieldName in fieldDefs) {
            const fieldDef = fieldDefs[fieldName];

            let fieldValue: any = undefined;
            if (fieldDef.dataPath) {
                fieldValue = lodash.get(dataModel, fieldDef.dataPath);
            }
            // eslint-disable-next-line no-prototype-builtins
            if (fieldValue === undefined && fieldDef.hasOwnProperty('initialValue')) {
                fieldValue = fieldDef.initialValue;
            }

            switch (fieldDef.dataType) {
                case FieldDataType.Text:
                case FieldDataType.RichText:
                case FieldDataType.Dropdown:
                    if (fieldValue == null) {
                        fieldValue = '';
                    }
                    break;
                case FieldDataType.Date:
                    if (isEmpty(fieldValue) || fieldValue === '0001-01-01') {
                        fieldValue = undefined;
                    } else {
                        fieldValue = this.parserFormatter.parseJsonDate(fieldValue);
                    }
                    // Output fieldValue is a Date object | undefined
                    break;
                case FieldDataType.DateTime:
                    // (input) Json format: 2020-02-01T01:02:03Z
                    if (fieldValue == null) {
                        fieldValue = '';
                    } else {
                        // Convert fieldValue (e.g. string) to Date object, in current/running timezone
                        fieldValue = new Date(fieldValue);
                    }
                    // Output fieldValue is either formatted datetime string or empty
                    break;
                case FieldDataType.Integer:
                    fieldValue =
                        this.parserFormatter.parseInteger(fieldValue?.toString(), fieldDef.isBlankWhenZero) ?? 0;
                    break;
                case FieldDataType.NullableInteger:
                    fieldValue = this.parserFormatter.parseInteger(fieldValue?.toString(), false) ?? null;
                    break;
                case FieldDataType.Float:
                    fieldValue =
                        this.parserFormatter.parseFloat(
                            fieldValue?.toString(),
                            fieldDef.format?.precision,
                            fieldDef.isBlankWhenZero
                        ) ?? 0;
                    break;
                case FieldDataType.NullableFloat:
                    fieldValue =
                        this.parserFormatter.parseFloat(fieldValue?.toString(), fieldDef.format?.precision, false) ??
                        null;
                    break;
                case FieldDataType.Boolean:
                    if (!fieldValue || fieldValue === 'false') {
                        fieldValue = false;
                    } else {
                        fieldValue = true;
                    }
                    // Output fieldValue is boolean
                    break;
                case FieldDataType.NullableBoolean:
                    // If null or undefined, leave it
                    if (fieldValue != null) {
                        fieldValue = fieldValue.toString() !== 'false';
                    }
                    // Output fieldValue is boolean | null
                    break;
                default:
                    throw new Error('Unsuppored deserialization data type');
            }

            fieldValues[fieldName] = fieldValue;
        }

        return fieldValues;
    };

    /**
     * Loads data from data model object into a list field value
     *
     * @param dataModelArray model array object
     * @param fieldDefs Field definitions
     * @returns field values in a object dictionary
     */
    deserializeList = (dataModelArray: Array<any>, fieldDefs: IFieldDefs): Array<IDictionary> => {
        const rows = new Array<IDictionary>();

        if (dataModelArray) {
            for (const dataModel of dataModelArray) {
                const row = this.deserialize(dataModel, fieldDefs);
                rows.push(row);
            }
        }

        return rows;
    };

    /**
     * Saves field values into the data model object
     *
     * @param fieldValues field values to serialize into the model
     * @param fieldDefs Field definitions
     */
    serialize = (fieldValues: IDictionary, fieldDefs: IFieldDefs): IDictionary => {
        const dataModel = {};

        for (const fieldName in fieldDefs) {
            const fieldDef = fieldDefs[fieldName];
            if (!fieldDef.dataPath || fieldDef.isReadOnly) {
                continue;
            }

            let fieldValue = fieldValues[fieldName];
            const dataType = fieldDef.dataType;

            switch (fieldDef.dataType) {
                case FieldDataType.Text:
                case FieldDataType.RichText:
                case FieldDataType.Boolean:
                case FieldDataType.NullableBoolean:
                    break;
                case FieldDataType.Dropdown:
                    if (fieldValue === '' && fieldDef.isNullWhenEmpty) {
                        fieldValue = null;
                    }
                    break;
                case FieldDataType.Date:
                    if (fieldValue) {
                        fieldValue = this.parserFormatter.formatIsoDate(fieldValue);
                    }
                    break;
                case FieldDataType.DateTime:
                    if (fieldValue) {
                        fieldValue = this.parserFormatter.formatIsoDateTime(fieldValue);
                    }
                    break;
                case FieldDataType.Integer: {
                    const integerString: string = fieldValue?.toString();
                    fieldValue = this.parserFormatter.parseInteger(integerString, fieldDef.isBlankWhenZero);
                    break;
                }
                case FieldDataType.NullableInteger: {
                    const integerString: string = fieldValue?.toString();
                    fieldValue = this.parserFormatter.parseInteger(integerString, false);
                    break;
                }
                case FieldDataType.Float: {
                    const floatString: string = fieldValue?.toString();
                    fieldValue = this.parserFormatter.parseFloat(
                        floatString,
                        fieldDef.format?.precision,
                        fieldDef.isBlankWhenZero
                    );
                    break;
                }
                case FieldDataType.NullableFloat: {
                    const floatString: string = fieldValue?.toString();
                    fieldValue = this.parserFormatter.parseFloat(
                        floatString,
                        (fieldDef as INullableFloatFieldDef).format?.precision,
                        false
                    );
                    break;
                }
                default:
                    throw new Error('Unsuppored serialization data type ' + dataType);
            }

            if (
                fieldDef.dataType === FieldDataType.Text ||
                fieldDef.dataType === FieldDataType.Dropdown ||
                fieldDef.dataType === FieldDataType.NullableBoolean ||
                fieldDef.dataType === FieldDataType.NullableFloat ||
                fieldDef.dataType === FieldDataType.NullableInteger ||
                !isEmpty(fieldValue)
            ) {
                lodash.set(dataModel, fieldDef.dataPath ?? '', fieldValue);
            }
        }

        return dataModel;
    };

    /**
     * Saves field values into the data model list
     *
     * @param dataModelArray model array object
     * @param fieldDefs Field definitions
     * @returns field values in a object dictionary
     */
    serializeList = (dataModelArray: IDictionary[], fieldDefs: IFieldDefs): Array<IDictionary> => {
        const rows = new Array<any>();

        if (dataModelArray) {
            for (const dataModel of dataModelArray) {
                const row = this.serialize(dataModel, fieldDefs);
                rows.push(row);
            }
        }

        return rows;
    };
}

/**
 * Check whether given value is undefined, null, or empty string
 */
function isEmpty(value: any): boolean {
    return value == null || value.length === 0;
}

