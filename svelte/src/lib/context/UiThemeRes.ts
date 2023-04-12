import type { IUiTheme } from '$lib/context/UiTheme';

export type ITheme = IUiTheme;

export const uiThemeRes: ITheme = {
    textField: {
        root: '',
        label: 'block font-semibold text-base',
        inputContainer: 'mt-1 relative',
        input: 'text-field-input text-base px-4',
        inputValid: 'focus:ring-indigo-500 focus:border-indigo-500 block w-full border-slate-300 rounded-md',
        inputError:
            'block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-md',
        inputReadonly:
            'focus:ring-indigo-500 focus:border-indigo-500 block w-full border-slate-300 rounded-md bg-slate-100',
        inputDisabled:
            'focus:ring-indigo-500 focus:border-indigo-500 block w-full border-slate-300 rounded-md bg-slate-100',
        prefixContainer: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none',
        prefix: 'text-gray-500 text-base',
        suffixContainer: 'absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none',
        suffix: 'text-gray-500 text-base',
        errorMessage: 'mt-2 text-red-600 text-sm',
    },
    numberField: {
        root: '',
        label: 'block font-semibold text-base',
        inputContainer: 'mt-1 relative',
        input: 'number-field-input text-base px-4',
        inputValid: 'focus:ring-indigo-500 focus:border-indigo-500 block w-full border-slate-300 rounded-md',
        inputError:
            'block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-md',
        inputReadonly:
            'focus:ring-indigo-500 focus:border-indigo-500 block w-full border-slate-300 rounded-md bg-slate-100',
        inputDisabled:
            'focus:ring-indigo-500 focus:border-indigo-500 block w-full border-slate-300 rounded-md bg-slate-100',
        prefixContainer: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none',
        prefix: 'text-gray-500 text-base',
        suffixContainer: 'absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none',
        suffix: 'text-gray-500 text-base',
        errorMessage: 'mt-2 text-red-600 text-sm',
    },
    fancyDropdownField: {
        root: 'fancy',
        label: 'block font-semibold text-base',
        dropdownContainer: 'mt-1',
        select: 'dropdown-field-select',
        selectValid: 'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-slate-300 rounded-lg',
        selectError:
            'block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-lg',
        errorMessage: 'mt-2 text-red-600 text-sm',
    },
    nativeDropdownField: {
        root: 'native',
        label: 'block font-semibold text-base',
        dropdownContainer: 'mt-1',
        select: 'dropdown-field-select',
        selectValid: 'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-slate-300 rounded-lg',
        selectError:
            'block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-lg',
        errorMessage: 'mt-2 text-red-600 text-sm',
    },
    inlineTextField: {
        root: '',
        label: 'block font-semibold text-base',
        inputContainer: 'mt-1 relative',
        input: 'text-field-input block w-full text-base px-4 border-0 border-b focus:ring-0 focus:border-b-2',
        inputValid: 'border-slate-300 focus:border-indigo-500',
        inputError: 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:border-red-500',
        inputReadonly: 'border-slate-300 bg-slate-100 focus:border-indigo-500',
        inputDisabled: 'border-slate-300 bg-slate-100 focus:border-indigo-500',
        prefixContainer: 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none',
        prefix: 'text-gray-500 text-base',
        suffixContainer: 'absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none',
        suffix: 'text-gray-500 text-base',
        errorMessage: 'mt-2 text-red-600 text-sm',
    },
    inlineFancyDropdownField: {
        root: 'inline-fancy',
        label: 'block font-semibold text-base',
        dropdownContainer: 'mt-1',
        select: 'dropdown-field-select',
        selectValid: 'shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border-slate-300',
        selectError:
            'block w-full pr-10 border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500',
        errorMessage: 'mt-2 text-red-600 text-sm',
    },
};
