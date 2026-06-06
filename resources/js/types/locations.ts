export type Location = {
    id: number;
    is_active: boolean;
    name: string;
    country: string;
    city: string;
    street_address: string;
    unit: string | null;
    postal_code: string;
    timezone: string;
    phone: string | null;
};

export type SelectOption = {
    value: string;
    label: string;
};
