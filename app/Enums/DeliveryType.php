<?php

namespace App\Enums;

enum DeliveryType: string
{
    case Online = 'online';
    case Onsite = 'onsite';

    /**
     * Get the display label for the delivery type.
     */
    public function label(): string
    {
        return ucfirst($this->value);
    }

    /**
     * Get all delivery types as select options.
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
