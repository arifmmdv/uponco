import { usePage } from '@inertiajs/react';
import { Mail, UserPlus } from 'lucide-react';
import { useState } from 'react';
import InviteMemberModal from '@/components/invite-member-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import type { Onboarding } from '@/types';
import type { StepControls } from './controls';
import OnboardingFooter from './onboarding-footer';

type Props = {
    data: Onboarding['members'];
    controls: StepControls;
};

export default function StepMembers({ data, controls }: Props) {
    const { currentTeam } = usePage().props;
    const getInitials = useInitials();

    const [inviteOpen, setInviteOpen] = useState(false);

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Invite the people you work with. You can always add more later,
                or skip this for now.
            </p>

            <div className="space-y-3">
                {data.members.map((member) => (
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
                                <div className="font-medium">{member.name}</div>
                                <div className="text-sm text-muted-foreground">
                                    {member.email}
                                </div>
                            </div>
                        </div>
                        <Badge variant="secondary">{member.role_label}</Badge>
                    </div>
                ))}

                {data.invitations.map((invitation) => (
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

            {currentTeam && data.permissions.canCreateInvitation ? (
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
                        availableRoles={data.availableRoles}
                        open={inviteOpen}
                        onOpenChange={setInviteOpen}
                    />
                </>
            ) : null}

            <OnboardingFooter
                showBack={controls.showBack}
                onBack={controls.onBack}
                saving={controls.saving}
                onSkip={controls.onSkip}
                onContinue={controls.onComplete}
            />
        </div>
    );
}
