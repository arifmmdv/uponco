export type TimeSlot = { start: string; end: string };

export type DaySchedule = { enabled: boolean; slots: TimeSlot[] };

export type DayKey =
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';

export type WeeklySchedule = Record<DayKey, DaySchedule>;

export const DAY_KEYS: DayKey[] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
];

export const DAY_LABELS: Record<DayKey, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
};
