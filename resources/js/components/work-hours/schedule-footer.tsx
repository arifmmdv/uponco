import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ScheduleFooterProps = {
    processing: boolean;
    onDiscard: () => void;
};

export default function ScheduleFooter({
    processing,
    onDiscard,
}: ScheduleFooterProps) {
    return (
        <div className="flex items-center justify-end gap-3 pt-2">
            <Button
                type="button"
                variant="ghost"
                onClick={onDiscard}
                disabled={processing}
            >
                Discard Changes
            </Button>

            <Button type="submit" disabled={processing}>
                <Check className="h-4 w-4" />
                Save Schedule
            </Button>
        </div>
    );
}
