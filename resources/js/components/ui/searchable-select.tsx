import { Check, ChevronDown, Search } from 'lucide-react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type SelectOption = {
    value: string;
    label: string;
};

type SearchableSelectProps = {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    id?: string;
    disabled?: boolean;
    invalid?: boolean;
    className?: string;
    'data-test'?: string;
};

export function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search…',
    emptyMessage = 'No results found.',
    id,
    disabled,
    invalid,
    className,
    ...props
}: SearchableSelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const selected = options.find((option) => option.value === value);

    const filtered = query.trim()
        ? options.filter((option) =>
              option.label.toLowerCase().includes(query.trim().toLowerCase()),
          )
        : options;

    const close = () => {
        setOpen(false);
        setQuery('');
    };

    const select = (nextValue: string) => {
        onChange(nextValue);
        close();
    };

    return (
        <div className={cn('relative', className)} {...props}>
            <button
                type="button"
                id={id}
                disabled={disabled}
                aria-invalid={invalid}
                aria-expanded={open}
                onClick={() => setOpen((previous) => !previous)}
                className={cn(
                    'flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-transparent px-4 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30',
                )}
            >
                <span
                    className={cn(
                        'truncate',
                        !selected && 'text-muted-foreground',
                    )}
                >
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown className="size-4 shrink-0 opacity-50" />
            </button>

            {open ? (
                <>
                    <button
                        type="button"
                        aria-hidden
                        tabIndex={-1}
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={close}
                    />
                    <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
                        <div className="flex items-center border-b px-2">
                            <Search className="size-4 shrink-0 opacity-50" />
                            <Input
                                autoFocus
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (event.key === 'Escape') {
                                        close();
                                    }
                                }}
                                placeholder={searchPlaceholder}
                                className="h-9 border-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto p-1">
                            {filtered.length === 0 ? (
                                <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                                    {emptyMessage}
                                </p>
                            ) : (
                                filtered.map((option) => (
                                    <button
                                        type="button"
                                        key={option.value}
                                        onClick={() => select(option.value)}
                                        className="flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                    >
                                        <span className="truncate">
                                            {option.label}
                                        </span>
                                        {option.value === value ? (
                                            <Check className="size-4 shrink-0" />
                                        ) : null}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
