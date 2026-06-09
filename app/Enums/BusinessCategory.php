<?php

namespace App\Enums;

enum BusinessCategory: string
{
    case Hairdresser = 'hairdresser';
    case BeautySalon = 'beauty_salon';
    case NailSalon = 'nail_salon';
    case Barbershop = 'barbershop';
    case MassageSalon = 'massage_salon';
    case Spa = 'spa';
    case TattooStudio = 'tattoo_studio';
    case Fitness = 'fitness';
    case YogaStudio = 'yoga_studio';
    case Physiotherapy = 'physiotherapy';
    case DentalClinic = 'dental_clinic';
    case MedicalClinic = 'medical_clinic';
    case VeterinaryClinic = 'veterinary_clinic';
    case PetGrooming = 'pet_grooming';
    case OnlineTutoring = 'online_tutoring';
    case Photography = 'photography';
    case Consulting = 'consulting';
    case AutomotiveRepair = 'automotive_repair';
    case Other = 'other';

    /**
     * Get the display label for the category.
     */
    public function label(): string
    {
        return match ($this) {
            self::Hairdresser => 'Hairdresser',
            self::BeautySalon => 'Beauty salon',
            self::NailSalon => 'Nail salon',
            self::Barbershop => 'Barbershop',
            self::MassageSalon => 'Massage salon',
            self::Spa => 'Spa',
            self::TattooStudio => 'Tattoo studio',
            self::Fitness => 'Fitness & personal training',
            self::YogaStudio => 'Yoga studio',
            self::Physiotherapy => 'Physiotherapy',
            self::DentalClinic => 'Dental clinic',
            self::MedicalClinic => 'Medical clinic',
            self::VeterinaryClinic => 'Veterinary clinic',
            self::PetGrooming => 'Pet grooming',
            self::OnlineTutoring => 'Online tutoring',
            self::Photography => 'Photography',
            self::Consulting => 'Consulting',
            self::AutomotiveRepair => 'Automotive repair',
            self::Other => 'Other',
        };
    }

    /**
     * Get the list of selectable categories, sorted by label.
     *
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        $options = array_map(fn (self $category): array => [
            'value' => $category->value,
            'label' => $category->label(),
        ], self::cases());

        usort($options, fn (array $a, array $b): int => strcmp($a['label'], $b['label']));

        return $options;
    }

    /**
     * Get the list of valid category values.
     *
     * @return list<string>
     */
    public static function values(): array
    {
        return array_map(fn (self $category): string => $category->value, self::cases());
    }
}
