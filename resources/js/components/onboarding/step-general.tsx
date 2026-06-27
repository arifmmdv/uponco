import { Form, usePage } from '@inertiajs/react';
import { Mail, UserPlus } from 'lucide-react';
import { useState } from 'react';
import OnboardingController from '@/actions/App/Http/Controllers/OnboardingController';
import InputError from '@/components/input-error';
import InviteMemberModal from '@/components/invite-member-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Separator } from '@/components/ui/separator';
import { useInitials } from '@/hooks/use-initials';
import type { Onboarding } from '@/types';
import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';

type Props = {
    data: Onboarding['general'];
    members: Onboarding['members'];
    controls: StepControls;
};

export default function StepGeneral({ data, members, controls }: Props) {
    const { currentTeam } = usePage().props;
    const teamSlug = currentTeam?.slug ?? '';
    const getInitials = useInitials();

    const [timezone, setTimezone] = useState(data.timezone ?? '');
    const [inviteOpen, setInviteOpen] = useState(false);

    return (
        <Form
            {...OnboardingController.saveGeneral.form(teamSlug)}
            options={{ preserveScroll: true }}
            onSuccess={controls.onComplete}
            className="space-y-8"
        >
            {({ errors, processing }) => (
                <>
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

                    <Separator />

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium">Team members</h3>
                            <p className="text-sm text-muted-foreground">
                                Invite the people you work with. This is
                                optional — you can add more later.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {members.members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            {member.avatar ? (
                                                <AvatarImage
                                                    src={member.avatar}
                                                    alt={member.name}
                                                />
                                            ) : null}
                                            <AvatarFallback>
                                                {getInitials(member.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">
                                                {member.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {member.email}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="secondary">
                                        {member.role_label}
                                    </Badge>
                                </div>
                            ))}

                            {members.invitations.map((invitation) => (
                                <div
                                    key={invitation.code}
                                    className="flex items-center justify-between rounded-lg border border-dashed p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {invitation.email}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Invited · {invitation.role_label}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline">Pending</Badge>
                                </div>
                            ))}
                        </div>

                        {currentTeam && members.permissions.canCreateInvitation ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setInviteOpen(true)}
                                    data-test="onboarding-invite-member"
                                >
                                    <UserPlus className="h-4 w-4" /> Invite member
                                </Button>

                                <InviteMemberModal
                                    team={currentTeam}
                                    availableRoles={members.availableRoles}
                                    open={inviteOpen}
                                    onOpenChange={setInviteOpen}
                                />
                            </>
                        ) : null}
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
