/**
 * culture information.
 *
 * Reference:
 * - Separator: https://en.wikipedia.org/wiki/Decimal_separator
 * - ISO code: http://docwiki.embarcadero.com/RADStudio/Rio/en/Language_Culture_Names,_Codes,_and_ISO_Values
 * - Date formats: https://en.wikipedia.org/wiki/Date_format_by_country
 * - IANA timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
 */

import currency from 'currency.js';
import { DateTime } from 'luxon';
import { get } from 'svelte/store';
import type { IUiContext } from './UiContext';
import { UiStringResKeys } from './UiStringResKeys';

const standardJsonFormats = {
    dateFormat: 'yyyy-MM-dd',
};

/**
 * Wrapper for culture and timezone specific parsing/formatting processing
 */
export class UiParserFormatter {
    private context: IUiContext;

    /**
     * constructor
     *
     * @param context The current context
     */
    constructor(context: IUiContext) {
        this.context = context;
    }

    getTimeZoneName(): string {
        return get(this.context.timeZoneName);
    }

    parseDate(dateString: string, format?: string): Date | null {
        const d = DateTime.fromFormat(dateString, format ?? this.context.str(UiStringResKeys.dateFormat));
        return d.isValid ? d.toJSDate() : null;
    }

    parseJsonDate(dateString: string): Date | null {
        return this.parseDate(dateString, standardJsonFormats.dateFormat);
    }

    formatDate(date: Date, format?: string): string {
        const d = DateTime.fromJSDate(date);
        return d.toFormat(format ?? this.context.str(UiStringResKeys.dateFormat));
    }

    formatTime(date: Date, format?: string): string {
        const d = DateTime.fromJSDate(date);
        return d.toFormat(format ?? this.context.str(UiStringResKeys.timeFormat));
    }

    formatIsoDate(date: Date): string {
        return this.formatDate(date, standardJsonFormats.dateFormat);
    }

    parseDateTime(dateTimeString: string, format?: string, timeZoneName?: string): Date | null {
        const d = DateTime.fromFormat(dateTimeString, format ?? this.context.str(UiStringResKeys.dateTimeFormat), {
            zone: timeZoneName ?? this.getTimeZoneName(),
        });
        return d.isValid ? d.toJSDate() : null;
    }

    formatDateTime(date: Date, format?: string, timeZoneName?: string): string {
        // Parse date to the timezone we want
        let d = DateTime.fromJSDate(date, { zone: this.getTimeZoneName() });
        // Change timezone if specified otherwise assume it is local time
        if (timeZoneName) {
            d = d.setZone(timeZoneName);
        }
        return d.toFormat(format ?? this.context.str(UiStringResKeys.dateTimeFormat));
    }

    formatIsoDateTime(date: Date): string {
        // Parse date to the timezone we want
        let d = DateTime.fromJSDate(date, { zone: this.getTimeZoneName() });
        // Convert to UTC
        d = d.setZone('utc');
        return d.toISO();
    }

    parseInteger(integerString: string, isBlankWhenZero?: boolean): number | null {
        if (!integerString && isBlankWhenZero) {
            return 0;
        }

        const pattern = this.context.str(UiStringResKeys.integerRegExp);
        const regexp = new RegExp(pattern);
        if (!regexp.test(integerString)) {
            return null;
        }

        const thousandsDelimeter = this.context.str(UiStringResKeys.thousandsDelimeter);
        const cleanString = integerString.replaceAll(' ', '').replaceAll(thousandsDelimeter, '');
        const parsed = parseInt(cleanString);
        if (isNaN(parsed)) {
            return null;
        } else {
            return parsed;
        }
    }

    formatInteger(integerValue: number, format?: currency.Options, isBlankWhenZero?: boolean): string {
        if (isBlankWhenZero && integerValue === 0) {
            return '';
        }

        return currency(integerValue, format ?? this.getIntegerFormat()).format();
    }

    getIntegerFormat(): currency.Options {
        return {
            symbol: '',
            separator: this.context.str(UiStringResKeys.thousandsDelimeter),
            decimal: this.context.str(UiStringResKeys.decimalPoint),
            precision: 0,
        };
    }

    parseFloat(floatString: string, decimalPlaces?: number, isBlankWhenZero?: boolean): number | null {
        if (!floatString && isBlankWhenZero) {
            return 0;
        }

        const pattern = this.context.str(UiStringResKeys.floatRegExp);
        const regexp = new RegExp(pattern);
        if (!regexp.test(floatString)) {
            return null;
        }

        const thousandsDelimeter = this.context.str(UiStringResKeys.thousandsDelimeter);
        const cleanString = floatString.replaceAll(' ', '').replaceAll(thousandsDelimeter, '');
        decimalPlaces = decimalPlaces ?? parseInt(UiStringResKeys.currencyDecimalPlaces);

        const parsed = Number(Math.round(parseFloat(cleanString + 'e' + decimalPlaces)) + 'e-' + decimalPlaces);
        if (isNaN(parsed)) {
            return null;
        } else {
            return parsed;
        }
    }

    formatFloat(floatValue: number, format?: currency.Options, isBlankWhenZero?: boolean): string {
        if (isBlankWhenZero && floatValue === 0) {
            return '';
        }

        return currency(floatValue, format ?? this.getFloatFormat()).format();
    }

    getFloatFormat(): currency.Options {
        return {
            symbol: '',
            separator: this.context.str(UiStringResKeys.thousandsDelimeter),
            decimal: this.context.str(UiStringResKeys.decimalPoint),
            precision: parseInt(this.context.str(UiStringResKeys.currencyDecimalPlaces)),
        };
    }

    parseCurrency(currencyString: string, format?: currency.Options, isBlankWhenZero?: boolean): currency | null {
        if (!currencyString && isBlankWhenZero) {
            return currency(0);
        }

        if (!format) {
            format = {
                symbol: this.context.str('culture.currencySymbol'),
                separator: this.context.str(UiStringResKeys.thousandsDelimeter),
                decimal: this.context.str(UiStringResKeys.decimalPoint),
                precision: parseInt(UiStringResKeys.currencyDecimalPlaces),
                errorOnInvalid: true,
            };
        }

        try {
            const parsed = currency(currencyString);
            return parsed;
        } catch {
            return null;
        }
    }

    formatCurrency(currencyValue: currency, format?: currency.Options, isBlankWhenZero?: boolean): string {
        if (isBlankWhenZero && currencyValue.value === 0) {
            return '';
        }

        return currencyValue.format(format ?? this.getFloatFormat());
    }

    formatCurrencyWithSymbol(currencyValue: currency, format?: currency.Options, isBlankWhenZero?: boolean): string {
        if (isBlankWhenZero && currencyValue.value === 0) {
            return '';
        }

        if (!format) {
            format = this.getFloatFormat();
            format.symbol = this.context.str('culture.currencySymbol');
        }

        return currencyValue.format(format);
    }

    /* https://github.com/moment/luxon/issues/655
     - DatePicker controller only accepts JS Date, and JS Date only displays in local/browser
     - Luxon DateTime can be converted to different time zones, but cannot use for date picker (need to call '.toJSDate()')
     - Therefore, to let date picker display date on different time zone, we have to create a fake date (cheat),
         which is in local/browser/user time zone, but on desired date
 
     Example:
     - (UTC/database) 9 Aug 2022 14:00 == (VN/local) 9 Aug 2022 21:00 == (AUS/server) 10 Aug 2022 00:00
     - to let date picker show '10 Aug 2022' (server time), we need to create a fake date '10 AU 2022 in VN/local/browser timezone')
     */

    // Convert given date to a desired one, which lets date picker display in server time zone
    convertToServerTimezoneForDatepicker(date: Date, serverTimezone: string): Date | null {
        // convert given date to string, in server time zone
        const dateStr = this.formatDateTime(date, this.context.str(UiStringResKeys.dateFormat), serverTimezone);

        // then use that string to parse to local/browser time zone (fake date)
        return this.parseDate(dateStr);
    }

    // Convert given date (from date picker in server time zone), to standard js date
    convertFromDataPickerToServerTimezone(date: Date, serverTimezone: string): Date | null {
        // parse to string first (ignore time and time zone)
        const dateStr = this.formatDate(date);

        // parse that string to JS Date with specific time zone
        return this.parseDateTime(dateStr, this.context.str(UiStringResKeys.dateFormat), serverTimezone);
    }
}
