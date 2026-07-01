import { useMemo } from 'react';
import PhoneInputWithCountry from 'react-phone-number-input';
import type { Country, Value } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { Input } from '@/components/ui/input';
import { countryFromTimezone } from '@/lib/timezone-country';
import { cn } from '@/lib/utils';

/**
 * Guess the visitor's country to pre-select the dial code. The browser timezone
 * reflects physical location, so it's tried first; the UI language is only a
 * fallback since an English browser in Latvia would otherwise resolve to the US.
 */
function detectDefaultCountry(): Country | undefined {
    const fromTimezone = countryFromTimezone();

    if (fromTimezone) {
        return fromTimezone as Country;
    }

    if (typeof navigator === 'undefined') {
        return undefined;
    }

    const locales = navigator.languages ?? [navigator.language];

    for (const locale of locales) {
        try {
            const region = new Intl.Locale(locale).maximize().region;

            if (region) {
                return region as Country;
            }
        } catch {
            // Ignore malformed locale strings and try the next one.
        }
    }

    return undefined;
}

type Props = {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    'aria-invalid'?: boolean;
    'data-test'?: string;
};

/**
 * International phone field with a searchable country selector and flags. The
 * country defaults to the visitor's locale and the value is stored in E.164
 * format so the backend always receives a normalized number.
 */
function InternationalPhoneInput({
    value,
    onChange,
    className,
    ...props
}: Props) {
    const defaultCountry = useMemo(detectDefaultCountry, []);

    return (
        <PhoneInputWithCountry
            international
            withCountryCallingCode
            limitMaxLength
            defaultCountry={defaultCountry}
            value={(value || undefined) as Value}
            onChange={(next?: Value) => onChange(next ?? '')}
            inputComponent={Input}
            numberInputProps={{ className, autoComplete: 'tel' }}
            className={cn(
                'flex items-center gap-2',
                '[&_.PhoneInputCountry]:m-0 [&_.PhoneInputCountry]:h-12 [&_.PhoneInputCountry]:gap-2 [&_.PhoneInputCountry]:rounded-md [&_.PhoneInputCountry]:border [&_.PhoneInputCountry]:border-input [&_.PhoneInputCountry]:bg-transparent [&_.PhoneInputCountry]:px-3 [&_.PhoneInputCountry]:transition-[color,box-shadow] focus-within:[&_.PhoneInputCountry]:border-ring focus-within:[&_.PhoneInputCountry]:ring-[3px] focus-within:[&_.PhoneInputCountry]:ring-ring/50',
                '[&_.PhoneInputCountryIcon]:shadow-none',
                '[&_.PhoneInputCountrySelectArrow]:text-muted-foreground [&_.PhoneInputCountrySelectArrow]:opacity-100',
                '[&_.PhoneInputInput]:flex-1',
            )}
            {...props}
        />
    );
}

export { InternationalPhoneInput };
