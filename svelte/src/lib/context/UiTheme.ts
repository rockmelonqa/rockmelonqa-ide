export interface IUiTheme {
    textField?: ITextFieldTheme;
    numberField?: ITextFieldTheme;
    fancyDropdownField?: IDropDownFieldTheme;
    nativeDropdownField?: IDropDownFieldTheme;

    inlineTextField?: ITextFieldTheme;
    inlineFancyDropdownField?: IDropDownFieldTheme;
}

export interface ITextFieldTheme {
    root?: string;
    label?: string;
    inputContainer?: string;
    input?: string;
    inputValid?: string;
    inputError?: string;
    inputReadonly?: string;
    inputDisabled?: string;
    prefixContainer?: string;
    prefix?: string;
    suffixContainer?: string;
    suffix?: string;
    errorMessage?: string;
}

export interface IDropDownFieldTheme {
    root?: string;
    label?: string;
    dropdownContainer?: string;
    select?: string;
    selectValid?: string;
    selectError?: string;
    option?: string;
    errorMessage?: string;
}
