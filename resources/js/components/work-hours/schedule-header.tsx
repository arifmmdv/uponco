import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ScheduleHeaderProps = {
    canCopyMonday: boolean;
    onCopyMondayToAll: () => void;
};

export default function ScheduleHeader({
    canCopyMonday,
    onCopyMondayToAll,
}: ScheduleHeaderProps) {
    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h3 className="text-base font-medium">Weekly hours</h3>
                <p className="text-sm text-muted-foreground">
                    Set the hours you are available each day of the week.
                </p>
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canCopyMonday}
                onClick={onCopyMondayToAll}
            >
                <Copy className="h-4 w-4" />
                Copy Monday to all
            </Button>
        </div>
    );
}
