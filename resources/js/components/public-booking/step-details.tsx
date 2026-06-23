import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';

export type CustomerDetails = {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    notes: string;
};

type Props = {
    values: CustomerDetails;
    onChange: (field: keyof CustomerDetails, value: string) => void;
    errors: Partial<Record<string, string>>;
};

/**
 * Step three: personal information. The booking recap lives in the inline
 * summary bar at the top of the flow.
 */
export default function StepDetails({ values, onChange, errors }: Props) {
    return (
        <div className="space-y-6">
            <section className="space-y-4">
                <h2 className="text-sm font-medium">Your details</h2>

                <div className="grid gap-2">
                    <Label htmlFor="customer_name">Name surname</Label>
                    <Input
                        id="customer_name"
                        className="h-12"
                        value={values.customer_name}
                        onChange={(event) =>
                            onChange('customer_name', event.target.value)
                        }
                        placeholder="Jane Doe"
                        aria-invalid={Boolean(errors.customer_name)}
                        data-test="appointment-customer-name-input"
                    />
                    <InputError message={errors.customer_name} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="customer_email">Email</Label>
                    <Input
                        id="customer_email"
                        type="email"
                        className="h-12"
                        value={values.customer_email}
                        onChange={(event) =>
                            onChange('customer_email', event.target.value)
                        }
                        placeholder="jane@example.com"
                        aria-invalid={Boolean(errors.customer_email)}
                        data-test="appointment-customer-email-input"
                    />
                    <InputError message={errors.customer_email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="customer_phone">Phone</Label>
                    <PhoneInput
                        id="customer_phone"
                        className="h-12"
                        value={values.customer_phone}
                        onChange={(event) =>
                            onChange('customer_phone', event.target.value)
                        }
                        placeholder="+1 555 123 4567"
                        aria-invalid={Boolean(errors.customer_phone)}
                        data-test="appointment-customer-phone-input"
                    />
                    <InputError message={errors.customer_phone} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                        id="notes"
                        value={values.notes}
                        onChange={(event) =>
                            onChange('notes', event.target.value)
                        }
                        placeholder="Anything we should know before your visit…"
                        rows={3}
                        data-test="appointment-notes-input"
                    />
                    <InputError message={errors.notes} />
                </div>
            </section>
        </div>
    );
}
