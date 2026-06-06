<?php

namespace App\Enums;

enum PriceType: string
{
    case Free = 'free';
    case Fixed = 'fixed';
    case Range = 'range';

    /**
     * Get the display label for the price type.
     */
    public function label(): string
    {
        return ucfirst($this->value);
    }

    /**
     * Get all price types as select options.
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
