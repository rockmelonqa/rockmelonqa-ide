import { DateTime } from 'luxon';
import { addMessages, getLocaleFromNavigator, init, locale, _ } from 'svelte-i18n';
import { get, writable, type Subscriber, type Unsubscriber, type Updater, type Writable } from 'svelte/store';

/**
 * Type for svelte-i18n locale
 */
export interface IUiLocale {
    set: (newLocale: string | null | undefined) => void | Promise<void>;
    update(this: void, updater: Updater<string | null | undefined>): void;
    subscribe(
        this: void,
        run: Subscriber<string | null | undefined>,
        invalidate?: ((value?: string | null | undefined) => void) | undefined
    ): Unsubscriber;
}

/**
 * UiContext provides the locale details including string resources,
 * date, time and number formats.
 */
export interface IUiContext {
    /** Wrapper for svelte-i18n locale */
    locale: IUiLocale;

    /** Timezone IANA name */
    timeZoneName: Writable<string>;

    /**
     * Get string resource
     *
     * @param key Unique key to idenitfy the string
     * @interpolationValues values to inject into the string. eg. `{ name: 'abc' }`
     */
    str: (
        key: string,
        interpolationValues?: Record<string, string | number | boolean | Date | null | undefined>
    ) => string;

    /** Theme class */
    theme: Writable<{ [name: string]: any }>;

    pathSeparator: string;
    eol: string;
}

/**
 * Key used to get ui context
 */
export const uiContextKey = Symbol();

/**
 * Call this at startup in the root `__layout.svelte` in order to set the initial locale
 *
 * @param themeRes Theme resource map
 * @param stringRes String resource map when the property name is the locale, and the value is the string table
 * @param userLocale ISO culture code. Defaults to "en-AU"
 * @param userTimeZoneName IANA timezone code. Eg `Australia/Sydney`
 * @returns
 */
export function createUiContext(
    themeRes: { [name: string]: any },
    stringRes: { [name: string]: any },
    userLocale?: string,
    userTimeZoneName?: string
): IUiContext {
    const theme = writable(themeRes);

    // Load string res tables and init string res
    for (const key in stringRes) {
        validateStringRes(key, stringRes[key]);
        addMessages(key, stringRes[key]);
    }
    init({
        fallbackLocale: 'en',
        initialLocale: userLocale ?? getLocaleFromNavigator(),
    });

    const timeZoneName = writable(userTimeZoneName ?? DateTime.local().zoneName);

    // Return the context
    return {
        locale,
        timeZoneName,
        str: (
            key: string,
            interpolationValues?: Record<string, string | number | boolean | Date | null | undefined>
        ) => {
            if (interpolationValues) {
                const values = { values: interpolationValues };
                return get(_)(key, values);
            } else {
                return get(_)(key);
            }
        },
        theme,

        // default value. Should be determined by OS
        pathSeparator: '/',
        eol: '\n',
    };
}

function validateStringRes(stringResName: string, stringRes: any) {
    if (!stringRes.culture) {
        throw `"culture" not defined in string res for ${stringResName}`;
    }
    if (!stringRes.culture.locale) {
        throw `"culture.locale" not defined in string res for ${stringResName}`;
    }
    if (!stringRes.culture.dateFormat) {
        throw `"culture.dateFormat" not defined in string res for ${stringResName}`;
    }
    if (!stringRes.culture.dateTimeFormat) {
        throw `"culture.dateTimeFormat" not defined in string res for ${stringResName}`;
    }
    if (!stringRes.culture.thousandsDelimeter) {
        throw `"culture.thousandsDelimeter" not defined in string res for ${stringResName}`;
    }
    if (!stringRes.culture.decimalPoint) {
        throw `"decimalPoint" not defined in string res for ${stringResName}`;
    }
    if (!stringRes.culture.integerRegExp) {
        throw `"integerRegExp" not defined in string res for ${stringResName}`;
    }
    if (!stringRes.culture.floatRegExp) {
        throw `"floatRegExp" not defined in string res for ${stringResName}`;
    }
    if (!stringRes.culture.currencySymbol) {
        throw `"currencySymbol" not defined in string res for ${stringResName}`;
    }
    if (!stringRes.culture.currencyCode) {
        throw `"currencyCode" not defined in string res for ${stringResName}`;
    }
    if (!stringRes.culture.currencyDecimalPlaces) {
        throw `"currencyDecimalPlaces" not defined in string res for ${stringResName}`;
    }
}
