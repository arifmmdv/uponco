import { useCallback, useState } from 'react';

/**
 * Persist a piece of React state in `localStorage`.
 *
 * The stored value is read once when the hook mounts (lazy initializer) and
 * written back whenever it changes. This app renders client-side only, so
 * reading storage during the initial render does not risk a hydration mismatch.
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T,
): readonly [T, (value: T | ((previous: T) => T)) => void] {
    const [value, setValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const stored = window.localStorage.getItem(key);

            return stored !== null ? (JSON.parse(stored) as T) : initialValue;
        } catch {
            // Corrupt or unreadable entry: fall back to the initial value.
            return initialValue;
        }
    });

    const setStoredValue = useCallback(
        (next: T | ((previous: T) => T)) => {
            setValue((previous) => {
                const resolved =
                    typeof next === 'function'
                        ? (next as (previous: T) => T)(previous)
                        : next;

                if (typeof window !== 'undefined') {
                    try {
                        window.localStorage.setItem(
                            key,
                            JSON.stringify(resolved),
                        );
                    } catch {
                        // Storage full or unavailable: keep in-memory state only.
                    }
                }

                return resolved;
            });
        },
        [key],
    );

    return [value, setStoredValue] as const;
}
