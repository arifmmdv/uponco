<?php

namespace App\Enums;

enum ServiceType: string
{
    case Individual = 'individual';
    case Group = 'group';

    /**
     * Get the display label for the service type.
     */
    public function label(): string
    {
        return ucfirst($this->value);
    }

    /**
     * Get all service types as select options.
     *
     * @return array<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->map(fn (self $type) => ['value' => $type->value, 'label' => $type->label()])
            ->values()
            ->toArray();
    }
}
