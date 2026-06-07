import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import type { Appointment } from '@/types';

type Props = {
    appointment: Appointment | null;
    errors: Partial<Record<string, string>>;
};

/**
 * The customer details section of the appointment form. A customer record is
 * created automatically on the server when the details don't match an existing
 * customer for the team.
 */
export default function AppointmentCustomerFields({
    appointment,
    errors,
}: Props) {
    const customer = appointment?.customer ?? null;

    return (
        <div className="space-y-4 rounded-lg border p-4">
            <div className="space-y-0.5">
                <h3 className="text-sm font-medium">Customer</h3>
                <p className="text-sm text-muted-foreground">
                    We'll create a new customer if these details don't match an
                    existing one.
                </p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="customer_name">Name surname</Label>
                <Input
                    id="customer_name"
                    name="customer_name"
                    defaultValue={customer?.name ?? ''}
                    placeholder="Jane Doe"
                    data-test="appointment-customer-name-input"
                />
                <InputError message={errors.customer_name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                    id="customer_email"
                    name="customer_email"
                    type="email"
                    defaultValue={customer?.email ?? ''}
                    placeholder="jane@example.com"
                    data-test="appointment-customer-email-input"
                />
                <InputError message={errors.customer_email} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="customer_phone">Phone</Label>
                <PhoneInput
                    id="customer_phone"
                    name="customer_phone"
                    defaultValue={customer?.phone ?? ''}
                    placeholder="+1 555 123 4567"
                    data-test="appointment-customer-phone-input"
                />
                <InputError message={errors.customer_phone} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={appointment?.notes ?? ''}
                    placeholder="Anything to note for this appointment…"
                    rows={3}
                    data-test="appointment-notes-input"
                />
                <InputError message={errors.notes} />
            </div>
        </div>
    );
}
