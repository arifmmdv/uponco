export type Location = {
    id: number;
    is_active: boolean;
    name: string;
    country: string;
    city: string;
    street_address: string;
    unit: string | null;
    postal_code: string;
    phone: string | null;
    service_ids: number[];
    user_ids: number[];
};

export type SelectOption = {
    value: string;
    label: string;
};
