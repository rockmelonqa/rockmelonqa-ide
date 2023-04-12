export const UiStringResKeys = {
    // Luxon date format used in the UiParserFormatter
    // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    dateFormat: 'culture.dateFormat',
    timeFormat: 'culture.timeFormat',
    dateTimeFormat: 'culture.dateTimeFormat',

    // Vanilla JS Datepicker format
    // https://mymth.github.io/vanillajs-datepicker/#/date-string+format
    dateFormatDatePicker: 'culture.dateFormatDatePicker',

    integerRegExp: 'culture.integerRegExp',
    floatRegExp: 'culture.floatRegExp',
    thousandsDelimeter: 'culture.thousandsDelimeter',
    decimalPoint: 'culture.decimalPoint',
    currencyDecimalPlaces: 'culture.currencyDecimalPlaces',

    yesDropdownLabel: 'form.yesDropdownLabel',
    noDropdownLabel: 'form.noDropdownLabel',
    isRequiredError: 'form.isRequiredError',
    minLengthError: 'form.minLengthError',
    maxLengthError: 'form.maxLengthError',
    patternError: 'form.patternError',
    minDateError: 'form.minDateError',
    maxDateError: 'form.maxDateError',
    invalidDateTimeError: 'form.invalidDateTimeError',
    invalidIntegerError: 'form.invalidIntegerError',
    minIntegerError: 'form.minIntegerError',
    maxIntegerError: 'form.maxIntegerError',
    invalidFloatError: 'form.invalidFloatError',
    minFloatError: 'form.minFloatError',
    maxFloatError: 'form.maxFloatError',
};

export interface ICultureStringRes {
    locale: string;
    dateFormat: string;
    timeFormat: string;
    dateTimeFormat: string;
    dateFormatDatePicker: string;
    integerRegExp: string;
    floatRegExp: string;
    thousandsDelimeter: string;
    decimalPoint: string;
    currencySymbol: string;
    currencyCode: string;
    currencyDecimalPlaces: string;
}

export interface IFormStringRes {
    yesDropdownLabel: string;
    noDropdownLabel: string;
    isRequiredError: string;
    minLengthError: string;
    maxLengthError: string;
    patternError: string;
    minDateError: string;
    maxDateError: string;
    invalidDateError: string;
    invalidDateTimeError: string;
    minIntegerError: string;
    maxIntegerError: string;
    invalidIntegerError: string;
    minFloatError: string;
    maxFloatError: string;
    invalidFloatError: string;
}
