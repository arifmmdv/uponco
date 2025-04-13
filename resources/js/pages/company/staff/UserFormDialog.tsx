import {useStaff} from './StaffContext';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import InputError from "@/components/input-error";
import {Checkbox} from "@/components/ui/checkbox";
import {useAccessControl} from "@/hooks/useAccessControl";
import {Permissions} from "@/config/Permissions";
import {defaultRoles} from "@/config/Roles";

export function UserFormDialog() {
    const {
        open,
        setOpen,
        isEditing,
        processing,
        saveSuccess,
        closeModal,
        openAddUserModal,
        submitForm
    } = useStaff();

    const { hasPermission } = useAccessControl();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {hasPermission(Permissions.AddStaff) && (
                <DialogTrigger asChild>
                    <Button variant="default" onClick={openAddUserModal}>Add User</Button>
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogDescription>
                    {isEditing
                        ? 'Update the details of an existing user'
                        : 'Add a new user to your company'}
                </DialogDescription>
                <form className="space-y-6" onSubmit={submitForm}>
                    <NameField />
                    <EmailField />
                    <RoleField />

                    {!isEditing && (
                        <>
                            <PasswordField />
                            <PasswordConfirmationField />
                        </>
                    )}

                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={closeModal}>
                                Cancel
                            </Button>
                        </DialogClose>

                        {saveSuccess && (
                            <span className="text-green-600 font-medium">Saved successfully!</span>
                        )}

                        <Button variant="default" disabled={processing} asChild>
                            <button type="submit">{isEditing ? 'Update User' : 'Add User'}</button>
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function NameField() {
    const { data, setData, errors } = useStaff();

    return (
        <div className="grid gap-2">
            <Label htmlFor="name">
                Name Surname
            </Label>

            <Input
                id="name"
                type="text"
                name="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
            />

            <InputError message={errors.name} />
        </div>
    );
}

function EmailField() {
    const { data, setData, errors } = useStaff();

    return (
        <div className="grid gap-2">
            <Label htmlFor="email">
                Email
            </Label>

            <Input
                id="email"
                type="email"
                name="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                placeholder="john.doe@example.com"
                autoComplete="email"
            />

            <InputError message={errors.email} />
        </div>
    );
}

function RoleField() {
    const { data, setData, errors } = useStaff();

    const handleRoleChange = (role: string, checked: boolean) => {
        let updatedRoles = [...data.roles];

        if (checked) {
            if (!updatedRoles.includes(role)) {
                updatedRoles.push(role);
            }
        } else {
            updatedRoles = updatedRoles.filter(r => r !== role);
        }

        setData('roles', updatedRoles);
    };

    return (
        <div className="grid gap-2">
            <Label>Roles</Label>
            <div className="flex flex-col gap-2">
                {defaultRoles.map((role) => (
                    <div key={role.name} className="flex items-center space-x-2">
                        <Checkbox
                            id={`role-${role.name}`}
                            checked={data.roles.includes(role.name)}
                            onCheckedChange={(checked) =>
                                handleRoleChange(role.name, checked === true)
                            }
                        />
                        <Label
                            htmlFor={`role-${role.name}`}
                            className="cursor-pointer"
                        >
                            {role.displayName}
                        </Label>
                    </div>
                ))}
            </div>
            <InputError message={errors.roles} />
        </div>
    );
}

function PasswordField() {
    const { data, setData, errors } = useStaff();

    return (
        <div className="grid gap-2">
            <Label htmlFor="password">
                Password
            </Label>

            <Input
                id="password"
                type="password"
                name="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
            />

            <InputError message={errors.password} />
        </div>
    );
}

function PasswordConfirmationField() {
    const { data, setData, errors, processing } = useStaff();

    return (
        <div className="grid gap-2">
            <Label htmlFor="password_confirmation">Confirm password</Label>
            <Input
                id="password_confirmation"
                type="password"
                required
                tabIndex={4}
                autoComplete="new-password"
                value={data.password_confirmation}
                onChange={(e) => setData('password_confirmation', e.target.value)}
                disabled={processing}
                placeholder="Confirm password"
            />
            <InputError message={errors.password_confirmation} />
        </div>
    );
}
