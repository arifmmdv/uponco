import { Phone } from 'lucide-react';
import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function PhoneInput({ className, ...props }: React.ComponentProps<'input'>) {
    return (
        <div className="relative">
            <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                className={cn('pl-9', className)}
                {...props}
            />
        </div>
    );
}

export { PhoneInput };
