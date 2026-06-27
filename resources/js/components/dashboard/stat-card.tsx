import { Link } from '@inertiajs/react';
import type { ComponentType } from 'react';

import { Card, CardContent } from '@/components/ui/card';

const numberFormatter = new Intl.NumberFormat();

type Props = {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: number;
    href: string;
};

export default function StatCard({ icon: Icon, label, value, href }: Props) {
    return (
        <Link href={href} className="group">
            <Card className="transition-colors group-hover:border-primary/40">
                <CardContent className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="text-2xl font-semibold tracking-tight">
                            {numberFormatter.format(value)}
                        </p>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                        <Icon className="size-5" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
