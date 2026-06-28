/**
 * Named colour accents for the dashboard tiles. Class strings are kept literal
 * (not interpolated) so Tailwind can detect and compile them.
 */
export type Accent = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';

type AccentStyles = {
    /** Gradient used for filled icon tiles and chart bars. */
    gradient: string;
    /** Soft tinted surface used for card backgrounds and hovers. */
    soft: string;
    /** Foreground colour for accented text. */
    text: string;
    /** Ring/border colour used on hover. */
    ring: string;
};

/**
 * The palette intentionally maps every accent to the brand primary colour so
 * the UI reads as a single, cohesive brand rather than a rainbow. The named
 * keys are kept for backwards compatibility with existing callers.
 */
const PRIMARY_ACCENT: AccentStyles = {
    gradient: 'from-[#0063ff] to-[#3884fe]',
    soft: 'bg-primary/10',
    text: 'text-primary',
    ring: 'group-hover:border-primary/40',
};

export const ACCENTS: Record<Accent, AccentStyles> = {
    indigo: PRIMARY_ACCENT,
    emerald: PRIMARY_ACCENT,
    amber: PRIMARY_ACCENT,
    rose: PRIMARY_ACCENT,
    sky: PRIMARY_ACCENT,
    violet: PRIMARY_ACCENT,
};
