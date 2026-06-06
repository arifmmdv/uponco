import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Location, SelectOption } from '@/types';

type Props = {
    locations: Location[];
    countries: SelectOption[];
    onEdit: (location: Location) => void;
    onDelete: (location: Location) => void;
};

export default function LocationsTable({
    locations,
    countries,
    onEdit,
    onDelete,
}: Props) {
    const countryLabels = new Map(
        countries.map((country) => [country.value, country.label]),
    );

    if (locations.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-10 text-center">
                <p className="text-sm text-muted-foreground">
                    No locations yet. Add your first location to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Timezone</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {locations.map((location) => (
                        <TableRow key={location.id} data-test="location-row">
                            <TableCell>
                                <Badge
                                    variant={
                                        location.is_active
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {location.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                                {location.name}
                            </TableCell>
                            <TableCell>{location.city}</TableCell>
                            <TableCell>
                                {countryLabels.get(location.country) ??
                                    location.country}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {location.timezone}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {location.phone ?? '—'}
                            </TableCell>
                            <TableCell className="text-right">
                                <TooltipProvider>
                                    <div className="flex items-center justify-end gap-1">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    data-test="location-edit-button"
                                                    onClick={() =>
                                                        onEdit(location)
                                                    }
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Edit location</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    data-test="location-delete-button"
                                                    onClick={() =>
                                                        onDelete(location)
                                                    }
                                                >
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Delete location</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </TooltipProvider>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
