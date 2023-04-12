import type { IUiContext } from '$lib/context/UiContext';
import { UiParserFormatter } from '$lib/context/UiParserFormatter';
import { UiStringResKeys } from '$lib/context/UiStringResKeys';
import {
    FieldDataType,
    isFieldRequired,
    type IBooleanDropdownFieldDef,
    type IDateFieldDef,
    type IDateTimeFieldDef,
    type IDictionary,
    type IDropdownFieldDef,
    type IFieldDef,
    type IFieldDefs,
    type IFloatFieldDef,
    type IIntegerFieldDef,
    type INullableFloatFieldDef,
    type INullableIntegerFieldDef,
    type IRichTextFieldDef,
    type ITextFieldDef,
    type ITimeFieldDef,
} from './FieldDef';

/**
 * Validates form fields
 */
export class FieldValidator {
    private uiContext: IUiContext;
    private parserFormatter: UiParserFormatter;

    /**
     * Defaults to the browser's current settings
     *
     * @param config Configuration for culture and timezone
     * @param uiContext String Resource to lookup error messages
     */
    constructor(uiContext: IUiContext) {
        this.uiContext = uiContext;
        this.parserFormatter = new UiParserFormatter(uiContext);
    }

    /**
     * Validate all rules for all fields on the form
     *
     * @param fieldValues Value of all fields
     * @param fieldDefs  Configuration of all fields
     * @param fieldsToValidate  Array of field names in fieldValues to validate. If undefined, all fields will be validated
     * @returns Dictionary of field names and error messages. null if no errors
     */
    validateFields(fieldValues: IDictionary, fieldDefs: IFieldDefs, fieldsToValidate?: string[]) {
        const errors: IDictionary = {};

        if (fieldsToValidate) {
            // Validate only field names specifeid in fieldsToValidate
            for (const fieldName of fieldsToValidate) {
                const fieldDef = fieldDefs[fieldName];
                const fieldValue = fieldValues[fieldName];

                errors[fieldName] = this.validateField(fieldName, fieldValue, fieldDef, fieldValues);
            }
        } else {
            // Validate all fields
            for (const fieldName in fieldDefs) {
                const fieldDef = fieldDefs[fieldName];
                const fieldValue = fieldValues[fieldName];

                errors[fieldName] = this.validateField(fieldName, fieldValue, fieldDef, fieldValues);
            }
        }

        return errors;
    }

    /**
     * Validates a field
     *
     * @param fieldName Name of the field
     * @param fieldValue Value of the field
     * @param fieldDef Field definition
     * @param fieldValues Value of all fields for cross field validation
     * @returns First error message or null if no errors
     */
    validateField(fieldName: string, fieldValue: any, fieldDef: IFieldDef, fieldValues: IDictionary): string | null {
        let errorMessage = null;
        switch (fieldDef.dataType) {
            case FieldDataType.Text:
                errorMessage = this.validateTextField(fieldName, fieldValue, fieldDef, fieldValues);
                break;
            case FieldDataType.RichText:
                errorMessage = this.validateRichTextField(fieldName, fieldValue, fieldDef, fieldValues);
                break;
            case FieldDataType.Dropdown:
                errorMessage = this.validateDropdownField(fieldName, fieldValue, fieldDef, fieldValues);
                break;
            case FieldDataType.Date:
                errorMessage = this.validateDateField(fieldName, fieldValue, fieldDef, fieldValues);
                break;
            case FieldDataType.DateTime:
                errorMessage = this.validateDateTimeField(fieldName, fieldValue, fieldDef, fieldValues);
                break;
            case FieldDataType.Integer:
                errorMessage = this.validateIntegerField(fieldName, fieldValue, fieldDef, fieldValues);
                break;
            case FieldDataType.NullableInteger:
                errorMessage = this.validateNullableIntegerField(fieldName, fieldValue, fieldDef, fieldValues);
                break;
            case FieldDataType.Float:
                errorMessage = this.validateFloatField(fieldName, fieldValue, fieldDef, fieldValues);
                break;
            case FieldDataType.NullableFloat:
                errorMessage = this.validateNullableFloatField(fieldName, fieldValue, fieldDef, fieldValues);
                break;
            case FieldDataType.Boolean:
            case FieldDataType.NullableBoolean:
                errorMessage = this.validateBooleanField(fieldName, fieldValue, fieldDef, fieldValues);
                break;
            case FieldDataType.List:
                break;
            default:
                throw new Error('Unrecognized data type');
        }

        if (errorMessage) {
            errorMessage = errorMessage.replace('{label}', fieldDef.label ?? fieldName);
            errorMessage = errorMessage.replace('{value}', fieldValue);
            return errorMessage;
        }

        return null;
    }

    validateRichTextField(
        fieldName: string,
        fieldValue: any,
        fieldDef: IRichTextFieldDef,
        fieldValues: IDictionary
    ): string | null {
        const htmlValue: string = fieldValue;
        const span = document.createElement('span');
        span.innerHTML = htmlValue;
        const textValue = span.textContent || span.innerText;

        let msg;
        if (isFieldRequired(fieldValues, fieldDef.isRequired)) {
            if (!textValue || textValue === '') {
                return fieldDef.isRequiredErrorMessage ?? this.uiContext.str(UiStringResKeys.isRequiredError);
            }
        }

        // Special validation here to allow alternative checking of required fields
        // On login screen, we don't want to show '*' so we cannot mark the field as required.
        // This means we need to use minLenght check instead
        if (fieldDef.minLength) {
            const length = textValue && textValue !== '' ? textValue.length : 0;
            if (length < fieldDef.minLength) {
                msg = fieldDef.minLengthErrorMessage ?? this.uiContext.str(UiStringResKeys.minLengthError);
                return msg.replace('{minLength}', fieldDef.minLength.toString());
            }
        }

        if (textValue) {
            if (fieldDef.maxLength) {
                if (textValue.length > fieldDef.maxLength) {
                    msg = fieldDef.maxLengthErrorMessage ?? this.uiContext.str(UiStringResKeys.maxLengthError);
                    return msg.replace('{maxLength}', fieldDef.maxLength.toString());
                }
            }

            if (fieldDef.onValidate) {
                msg = fieldDef.onValidate(fieldName, textValue, fieldValues, this.uiContext);
                if (msg) {
                    return msg;
                }
            }
        }

        return null;
    }

    validateTextField(
        fieldName: string,
        fieldValue: any,
        fieldDef: ITextFieldDef,
        fieldValues: IDictionary
    ): string | null {
        const textValue: string = fieldValue;
        let msg;
        if (isFieldRequired(fieldValues, fieldDef.isRequired)) {
            if (!textValue || textValue === '') {
                return fieldDef.isRequiredErrorMessage ?? this.uiContext.str(UiStringResKeys.isRequiredError);
            }
        }

        // Special validation here to allow alternative checking of required fields
        // On login screen, we don't want to show '*' so we cannot mark the field as required.
        // This means we need to use minLenght check instead
        if (fieldDef.minLength) {
            const length = textValue && textValue !== '' ? textValue.length : 0;
            if (length < fieldDef.minLength) {
                msg = fieldDef.minLengthErrorMessage ?? this.uiContext.str(UiStringResKeys.minLengthError);
                return msg.replace('{minLength}', fieldDef.minLength.toString());
            }
        }

        if (textValue) {
            if (fieldDef.maxLength) {
                if (textValue.length > fieldDef.maxLength) {
                    msg = fieldDef.maxLengthErrorMessage ?? this.uiContext.str(UiStringResKeys.maxLengthError);
                    return msg.replace('{maxLength}', fieldDef.maxLength.toString());
                }
            }

            if (fieldDef.pattern) {
                if (!fieldDef.pattern.test(fieldValue)) {
                    msg = fieldDef.patternErrorMessage ?? this.uiContext.str(UiStringResKeys.patternError);
                    return msg;
                }
            }

            if (fieldDef.onValidate) {
                msg = fieldDef.onValidate(fieldName, textValue, fieldValues, this.uiContext);
                if (msg) {
                    return msg;
                }
            }
        }

        return null;
    }

    validateBooleanField(
        fieldName: string,
        fieldValue: any,
        fieldDef: IBooleanDropdownFieldDef,
        fieldValues: IDictionary
    ): string | null {
        const textValue: string = fieldValue?.toString();
        let msg;

        if (isFieldRequired(fieldValues, fieldDef.isRequired)) {
            if (!textValue || textValue === '') {
                return fieldDef.isRequiredErrorMessage ?? this.uiContext.str(UiStringResKeys.isRequiredError);
            }
        }

        if (fieldDef.onValidate) {
            msg = fieldDef.onValidate(fieldName, fieldValue, fieldValues, this.uiContext);
            if (msg) {
                return msg;
            }
        }

        return null;
    }

    validateDropdownField(
        fieldName: string,
        fieldValue: any,
        fieldDef: IDropdownFieldDef,
        fieldValues: IDictionary
    ): string | null {
        const ddValue: string = fieldValue;

        if (isFieldRequired(fieldValues, fieldDef.isRequired)) {
            if (!ddValue || ddValue === '') {
                return fieldDef.isRequiredErrorMessage ?? this.uiContext.str(UiStringResKeys.isRequiredError);
            }
        }

        if (ddValue) {
            if (fieldDef.onValidate) {
                const msg = fieldDef.onValidate(fieldName, ddValue, fieldValues, this.uiContext);
                if (msg) {
                    return msg;
                }
            }
        }

        return null;
    }

    validateTimeField(
        fieldName: string,
        fieldValue: any,
        fieldDef: ITimeFieldDef,
        fieldValues: IDictionary
    ): string | null {
        const ddValue: Date = fieldValue;

        if (isFieldRequired(fieldValues, fieldDef.isRequired)) {
            if (!ddValue) {
                return fieldDef.isRequiredErrorMessage ?? this.uiContext.str(UiStringResKeys.isRequiredError);
            }
        }

        if (ddValue) {
            if (fieldDef.onValidate) {
                const msg = fieldDef.onValidate(fieldName, ddValue, fieldValues, this.uiContext);
                if (msg) {
                    return msg;
                }
            }
        }

        return null;
    }

    validateDateField(
        fieldName: string,
        fieldValue: any,
        fieldDef: IDateFieldDef,
        fieldValues: IDictionary
    ): string | null {
        const dateValue: Date = fieldValue;
        let msg;

        if (isFieldRequired(fieldValues, fieldDef.isRequired)) {
            if (!dateValue) {
                return fieldDef.isRequiredErrorMessage ?? this.uiContext.str(UiStringResKeys.isRequiredError);
            }
        }

        if (dateValue) {
            if (fieldDef.minDate) {
                if (dateValue < fieldDef.minDate) {
                    msg = fieldDef.minDateErrorMessage ?? this.uiContext.str(UiStringResKeys.minDateError);
                    return msg.replace('{minDate}', this.parserFormatter.formatDate(fieldDef.minDate, fieldDef.format));
                }
            }

            if (fieldDef.maxDate) {
                if (dateValue > fieldDef.maxDate) {
                    msg = fieldDef.maxDateErrorMessage ?? this.uiContext.str(UiStringResKeys.maxDateError);
                    return msg.replace('{maxDate}', this.parserFormatter.formatDate(fieldDef.maxDate, fieldDef.format));
                }
            }

            if (fieldDef.onValidate) {
                msg = fieldDef.onValidate(fieldName, dateValue, fieldValues, this.uiContext);
                if (msg) {
                    return msg;
                }
            }
        }

        return null;
    }

    validateDateTimeField(
        fieldName: string,
        fieldValue: any,
        fieldDef: IDateTimeFieldDef,
        fieldValues: IDictionary
    ): string | null {
        const datetimeValue: Date = fieldValue;
        let msg;

        if (isFieldRequired(fieldValues, fieldDef.isRequired)) {
            if (!datetimeValue) {
                return fieldDef.isRequiredErrorMessage ?? this.uiContext.str(UiStringResKeys.isRequiredError);
            }
        }

        if (datetimeValue) {
            if (fieldDef.minDateTime) {
                if (datetimeValue < fieldDef.minDateTime) {
                    msg = fieldDef.minDateTimeErrorMessage ?? this.uiContext.str(UiStringResKeys.minDateError);
                    return msg.replace(
                        '{minDate}',
                        this.parserFormatter.formatDate(fieldDef.minDateTime, fieldDef.format)
                    );
                }
            }

            if (fieldDef.maxDateTime) {
                if (datetimeValue > fieldDef.maxDateTime) {
                    msg = fieldDef.maxDateTimeErrorMessage ?? this.uiContext.str(UiStringResKeys.maxDateError);
                    return msg.replace(
                        '{maxDate}',
                        this.parserFormatter.formatDate(fieldDef.maxDateTime, fieldDef.format)
                    );
                }
            }

            if (fieldDef.onValidate) {
                msg = fieldDef.onValidate(fieldName, datetimeValue, fieldValues, this.uiContext);
                if (msg) {
                    return msg;
                }
            }
        }

        return null;
    }

    validateIntegerField(
        fieldName: string,
        fieldValue: any,
        fieldDef: IIntegerFieldDef,
        fieldValues: IDictionary
    ): string | null {
        const textValue: string = fieldValue?.toString();
        let msg;

        if (isFieldRequired(fieldValues, fieldDef.isRequired)) {
            if (!textValue || textValue === '') {
                return fieldDef.isRequiredErrorMessage ?? this.uiContext.str(UiStringResKeys.isRequiredError);
            }
        }

        if (textValue) {
            const integerValue = this.parserFormatter.parseInteger(textValue, fieldDef.isBlankWhenZero);
            if (integerValue == null) {
                return this.uiContext.str(UiStringResKeys.invalidIntegerError);
            }

            if (fieldDef.min !== undefined) {
                if (integerValue < fieldDef.min) {
                    msg = fieldDef.minErrorMessage ?? this.uiContext.str(UiStringResKeys.minIntegerError);
                    return msg.replace(
                        '{min}',
                        this.parserFormatter.formatInteger(fieldDef.min, fieldDef.format, false)
                    );
                }
            }

            if (fieldDef.max !== undefined) {
                if (integerValue > fieldDef.max) {
                    msg = fieldDef.maxErrorMessage ?? this.uiContext.str(UiStringResKeys.maxIntegerError);
                    return msg.replace(
                        '{max}',
                        this.parserFormatter.formatInteger(fieldDef.max, fieldDef.format, false)
                    );
                }
            }

            if (fieldDef.onValidate) {
                msg = fieldDef.onValidate(fieldName, integerValue, fieldValues, this.uiContext);
                if (msg) {
                    return msg;
                }
            }
        }

        return null;
    }

    validateNullableIntegerField(
        fieldName: string,
        fieldValue: any,
        fieldDef: INullableIntegerFieldDef,
        fieldValues: IDictionary
    ): string | null {
        const textValue: string = fieldValue?.toString();
        let msg;

        if (isFieldRequired(fieldValues, fieldDef.isRequired)) {
            if (!textValue || textValue === '') {
                return fieldDef.isRequiredErrorMessage ?? this.uiContext.str(UiStringResKeys.isRequiredError);
            }
        }

        if (textValue) {
            const integerValue = this.parserFormatter.parseInteger(textValue, fieldDef.isBlankWhenZero);
            if (integerValue == null) {
                return this.uiContext.str(UiStringResKeys.invalidIntegerError);
            }

            if (fieldDef.min !== undefined) {
                if (integerValue < fieldDef.min) {
                    msg = fieldDef.minErrorMessage ?? this.uiContext.str(UiStringResKeys.minIntegerError);
                    return msg.replace(
                        '{min}',
                        this.parserFormatter.formatInteger(fieldDef.min, fieldDef.format, false)
                    );
                }
            }

            if (fieldDef.max !== undefined) {
                if (integerValue > fieldDef.max) {
                    msg = fieldDef.maxErrorMessage ?? this.uiContext.str(UiStringResKeys.maxIntegerError);
                    return msg.replace(
                        '{max}',
                        this.parserFormatter.formatInteger(fieldDef.max, fieldDef.format, false)
                    );
                }
            }

            if (fieldDef.onValidate) {
                msg = fieldDef.onValidate(fieldName, integerValue, fieldValues, this.uiContext);
                if (msg) {
                    return msg;
                }
            }
        }

        return null;
    }

    validateFloatField(
        fieldName: string,
        fieldValue: any,
        fieldDef: IFloatFieldDef,
        fieldValues: IDictionary
    ): string | null {
        const textValue: string = fieldValue?.toString();
        let msg;

        if (isFieldRequired(fieldValues, fieldDef.isRequired)) {
            if (!textValue || textValue === '') {
                return fieldDef.isRequiredErrorMessage ?? this.uiContext.str(UiStringResKeys.isRequiredError);
            }
        }

        if (textValue) {
            const floatValue = this.parserFormatter.parseFloat(
                textValue,
                fieldDef.format?.precision,
                fieldDef.isBlankWhenZero
            );
            if (floatValue == null) {
                return this.uiContext.str(UiStringResKeys.invalidFloatError);
            }

            if (fieldDef.min !== undefined) {
                if (floatValue < fieldDef.min) {
                    msg = fieldDef.minErrorMessage ?? this.uiContext.str(UiStringResKeys.minFloatError);
                    return msg.replace('{min}', this.parserFormatter.formatFloat(fieldDef.min, fieldDef.format, false));
                }
            }

            if (fieldDef.max !== undefined) {
                if (floatValue > fieldDef.max) {
                    msg = fieldDef.maxErrorMessage ?? this.uiContext.str(UiStringResKeys.maxFloatError);
                    return msg.replace('{max}', this.parserFormatter.formatFloat(fieldDef.max, fieldDef.format, false));
                }
            }

            if (fieldDef.onValidate) {
                msg = fieldDef.onValidate(fieldName, floatValue, fieldValues, this.uiContext);
                if (msg) {
                    return msg;
                }
            }
        }

        return null;
    }

    validateNullableFloatField(
        fieldName: string,
        fieldValue: any,
        fieldDef: INullableFloatFieldDef,
        fieldValues: IDictionary
    ): string | null {
        const textValue: string = fieldValue?.toString();
        let msg;

        if (isFieldRequired(fieldValues, fieldDef.isRequired)) {
            if (!textValue || textValue === '') {
                return fieldDef.isRequiredErrorMessage ?? this.uiContext.str(UiStringResKeys.isRequiredError);
            }
        }

        if (textValue) {
            const floatValue = this.parserFormatter.parseFloat(textValue, fieldDef.format?.precision, false);
            if (floatValue == null) {
                return this.uiContext.str(UiStringResKeys.invalidFloatError);
            }

            if (fieldDef.min !== undefined) {
                if (floatValue < fieldDef.min) {
                    msg = fieldDef.minErrorMessage ?? this.uiContext.str(UiStringResKeys.minFloatError);
                    return msg.replace('{min}', this.parserFormatter.formatFloat(fieldDef.min, fieldDef.format, false));
                }
            }

            if (fieldDef.max !== undefined) {
                if (floatValue > fieldDef.max) {
                    msg = fieldDef.maxErrorMessage ?? this.uiContext.str(UiStringResKeys.maxFloatError);
                    return msg.replace('{max}', this.parserFormatter.formatFloat(fieldDef.max, fieldDef.format, false));
                }
            }

            if (fieldDef.onValidate) {
                msg = fieldDef.onValidate(fieldName, floatValue, fieldValues, this.uiContext);
                if (msg) {
                    return msg;
                }
            }
        }

        return null;
    }
}
