import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import AppLogoIcon from '@/components/app-logo-icon';
import {
    CalendarCheck,
    MapPin,
    Layers,
    Users,
    Globe,
    BellRing,
    Rocket,
    ArrowRight,
    Check,
} from 'lucide-react';
import type { ReactNode } from 'react';

const features: { icon: ReactNode; title: string; description: string }[] = [
    {
        icon: <MapPin className="size-5" />,
        title: 'Multi-location',
        description:
            'Manage bookings across every branch from a single, unified calendar.',
    },
    {
        icon: <Layers className="size-5" />,
        title: 'Multi-service',
        description:
            'Offer any number of services, each with its own duration and team.',
    },
    {
        icon: <Users className="size-5" />,
        title: 'Individual & group',
        description:
            'Take one-on-one appointments or fill group sessions with ease.',
    },
    {
        icon: <Globe className="size-5" />,
        title: 'Online or onsite',
        description:
            'Host virtual meetings or in-person visits — your customers choose.',
    },
    {
        icon: <BellRing className="size-5" />,
        title: 'Automatic reminders',
        description:
            'Cut no-shows with timely reminders sent to every customer.',
    },
    {
        icon: <Rocket className="size-5" />,
        title: '5-minute onboarding',
        description:
            'Set up your locations, services and team and start taking bookings today.',
    },
];

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/';

    return (
        <>
            <Head title="Your digital bridge to your customers" />

            <div className="min-h-screen bg-background text-foreground">
                {/* Header */}
                <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
                    <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-semibold"
                        >
                            <span className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary">
                                <AppLogoIcon className="size-5 fill-current text-white" />
                            </span>
                            <span>Uponco</span>
                        </Link>

                        <div className="flex items-center gap-2">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                >
                                    Dashboard
                                    <ArrowRight className="size-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                    >
                                        Get started
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </header>

                {/* Hero */}
                <section className="mx-auto w-full max-w-6xl px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-24">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                        <Check className="size-3.5 text-primary" />
                        First 100 bookings free — no card required
                    </span>

                    <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
                        Your digital bridge to your{' '}
                        <span className="text-primary">customers</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground text-balance">
                        Easy appointment booking for your business — multiple
                        locations, every service, online or onsite. Set up in
                        five minutes and let customers book in seconds.
                    </p>

                    <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        {auth.user ? (
                            <Link
                                href={dashboardUrl}
                                className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
                            >
                                Go to dashboard
                                <ArrowRight className="size-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={register()}
                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
                                >
                                    Start free
                                    <ArrowRight className="size-4" />
                                </Link>
                                <Link
                                    href={login()}
                                    className="inline-flex w-full items-center justify-center rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary sm:w-auto"
                                >
                                    Sign in
                                </Link>
                            </>
                        )}
                    </div>
                </section>

                {/* Features */}
                <section className="mx-auto w-full max-w-6xl px-6 py-16">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Everything you need to take bookings
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            One simple tool to connect your business with the
                            people who matter most.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-background p-6"
                            >
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    {feature.icon}
                                </div>
                                <h3 className="mt-4 font-medium">
                                    {feature.title}
                                </h3>
                                <p className="mt-1.5 text-sm text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Pricing highlight */}
                <section className="mx-auto w-full max-w-6xl px-6 py-16">
                    <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary px-6 py-14 text-center sm:px-12">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CalendarCheck className="size-6" />
                        </div>
                        <h2 className="mx-auto mt-6 max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
                            Your first 100 bookings are free
                        </h2>
                        <p className="mx-auto mt-4 max-w-lg text-muted-foreground text-balance">
                            No payment, no commitment. Get your business online,
                            start booking customers, and only pay once you’ve
                            grown.
                        </p>
                        {!auth.user && (
                            <Link
                                href={register()}
                                className="mt-8 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                            >
                                Create your account
                                <ArrowRight className="size-4" />
                            </Link>
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-border/60">
                    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="flex aspect-square size-6 items-center justify-center rounded-md bg-primary">
                                <AppLogoIcon className="size-3.5 fill-current text-white" />
                            </span>
                            Uponco
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Uponco. Your digital
                            bridge to your customers.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
