import { Check } from 'lucide-react';

import BookingSummary from '@/components/public-booking/booking-summary';
import { Button } from '@/components/ui/button';

type Props = {
    companyName: string;
    customerName: string;
    summary: {
        serviceTitle?: string;
        metaLabel?: string;
        specialistName?: string;
        locationName?: string | null;
        dateTimeLabel?: string;
    };
    onBookAnother: () => void;
};

/**
 * The terminal confirmation screen shown after a booking is created.
 */
export default function SuccessScreen({
    companyName,
    customerName,
    summary,
    onBookAnother,
}: Props) {
    return (
        <div className="flex animate-in flex-col items-center px-1 py-6 text-center duration-500 fade-in-0 zoom-in-95">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-6" />
                </span>
            </div>

            <h1 className="mt-5 text-xl font-semibold">You're booked in</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
                Thanks {customerName.split(' ')[0] || 'there'} — we've sent your
                appointment with {companyName} to our team.
            </p>

            <div className="mt-6 w-full text-left">
                <BookingSummary {...summary} />
            </div>

            <Button
                variant="outline"
                className="mt-6 h-12 w-full text-base"
                onClick={onBookAnother}
            >
                Book another appointment
            </Button>
        </div>
    );
}
