import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import {
    DayPicker,
    getDefaultClassNames,
    type DayButton,
} from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    const defaultClassNames = getDefaultClassNames();

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                root: cn('w-fit', defaultClassNames.root),
                months: cn(
                    'relative flex flex-col gap-4 sm:flex-row',
                    defaultClassNames.months,
                ),
                month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
                nav: cn(
                    'absolute inset-x-0 top-0 flex w-full items-center justify-between',
                    defaultClassNames.nav,
                ),
                button_previous: cn(
                    buttonVariants({ variant: 'ghost', size: 'icon' }),
                    'size-8 select-none p-0 text-muted-foreground hover:text-foreground',
                    defaultClassNames.button_previous,
                ),
                button_next: cn(
                    buttonVariants({ variant: 'ghost', size: 'icon' }),
                    'size-8 select-none p-0 text-muted-foreground hover:text-foreground',
                    defaultClassNames.button_next,
                ),
                month_caption: cn(
                    'flex h-8 items-center justify-center px-8',
                    defaultClassNames.month_caption,
                ),
                caption_label: cn(
                    'select-none text-sm font-medium',
                    defaultClassNames.caption_label,
                ),
                month_grid: cn(
                    'w-full border-collapse',
                    defaultClassNames.month_grid,
                ),
                weekdays: cn('flex', defaultClassNames.weekdays),
                weekday: cn(
                    'flex-1 select-none rounded-md text-[0.8rem] font-normal text-muted-foreground',
                    defaultClassNames.weekday,
                ),
                week: cn('mt-2 flex w-full', defaultClassNames.week),
                day: cn(
                    'relative aspect-square h-full w-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md',
                    defaultClassNames.day,
                ),
                today: cn(
                    'font-semibold text-primary [&>button]:ring-1 [&>button]:ring-primary/40',
                    defaultClassNames.today,
                ),
                outside: cn(
                    'text-muted-foreground aria-selected:text-muted-foreground',
                    defaultClassNames.outside,
                ),
                disabled: cn(
                    'text-muted-foreground/40 line-through [&>button]:pointer-events-none [&>button]:hover:bg-transparent',
                    defaultClassNames.disabled,
                ),
                hidden: cn('invisible', defaultClassNames.hidden),
                ...classNames,
            }}
            components={{
                Chevron: ({ orientation, className: chevronClassName }) => {
                    if (orientation === 'left') {
                        return (
                            <ChevronLeft
                                className={cn('size-4', chevronClassName)}
                            />
                        );
                    }

                    return (
                        <ChevronRight
                            className={cn('size-4', chevronClassName)}
                        />
                    );
                },
                DayButton: CalendarDayButton,
            }}
            {...props}
        />
    );
}

function CalendarDayButton({
    className,
    day,
    modifiers,
    ...props
}: React.ComponentProps<typeof DayButton>) {
    const ref = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        if (modifiers.focused) {
            ref.current?.focus();
        }
    }, [modifiers.focused]);

    return (
        <button
            ref={ref}
            type="button"
            data-day={day.date.toLocaleDateString()}
            data-selected-single={
                modifiers.selected &&
                !modifiers.range_start &&
                !modifiers.range_end &&
                !modifiers.range_middle
            }
            className={cn(
                buttonVariants({ variant: 'ghost' }),
                'flex aspect-square size-auto h-9 w-full min-w-9 flex-col gap-1 rounded-md font-normal leading-none',
                'hover:bg-accent hover:text-accent-foreground',
                'data-[selected-single=true]:bg-primary-gradient data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:hover:opacity-90',
                className,
            )}
            {...props}
        />
    );
}

export { Calendar };
