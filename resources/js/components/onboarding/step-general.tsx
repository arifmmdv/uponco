import { Form, usePage } from '@inertiajs/react';
import { useState } from 'react';
import BusinessController from '@/actions/App/Http/Controllers/Company/BusinessController';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import type { Onboarding } from '@/types';
import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';

type Props = {
    data: Onboarding['general'];
    controls: StepControls;
};

export default function StepGeneral({ data, controls }: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';

    const [timezone, setTimezone] = useState(data.timezone ?? '');

    return (
        <Form
            {...BusinessController.update.form(teamSlug)}
            options={{ preserveScroll: true }}
            onSuccess={controls.onComplete}
            className="space-y-6"
        >
            {({ errors, processing }) => (
                <>
                    <input type="hidden" name="name" value={data.name} />
                    <input
                        type="hidden"
                        name="business_category"
                        value={data.businessCategory ?? ''}
                    />
                    <input type="hidden" name="timezone" value={timezone} />

                    <div className="grid gap-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <SearchableSelect
                            id="timezone"
                            options={data.timezones}
                            value={timezone}
                            onChange={setTimezone}
                            placeholder="Select a timezone"
                            searchPlaceholder="Search timezones…"
                            emptyMessage="No timezones found."
                            invalid={Boolean(errors.timezone)}
                            data-test="onboarding-timezone-select"
                        />
                        <p className="text-sm text-muted-foreground">
                            Your timezone keeps bookings and availability
                            accurate. This is required to continue.
                        </p>
                        <InputError message={errors.timezone} />
                    </div>

                    <OnboardingFooter
                        showBack={controls.showBack}
                        onBack={controls.onBack}
                        saving={processing || controls.saving}
                        continueDisabled={!timezone}
                    />
                </>
            )}
        </Form>
    );
}
