import { useEffect, useState } from 'react';

/**
 * Tracks scroll direction and reports whether an auto-hiding bar (e.g. a mobile
 * top bar) should be hidden. The bar hides while scrolling down and reappears
 * while scrolling up, and is always shown near the top of the scroll container.
 *
 * The app scrolls inside the `#app` element (see app.css), but we listen on the
 * window in the capture phase so the handler fires regardless of which element
 * actually scrolls (scroll events don't bubble, but they do capture).
 */
export function useHideOnScroll(threshold: number = 10): boolean {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const getScrollTop = (): number => {
            const scroller = document.getElementById('app');

            if (scroller && scroller.scrollHeight > scroller.clientHeight) {
                return scroller.scrollTop;
            }

            return window.scrollY || document.documentElement.scrollTop;
        };

        let lastY = getScrollTop();
        let ticking = false;

        const update = () => {
            const currentY = getScrollTop();

            if (currentY <= threshold) {
                setHidden(false);
            } else if (currentY > lastY) {
                setHidden(true);
            } else if (currentY < lastY) {
                setHidden(false);
            }

            lastY = currentY;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        };

        window.addEventListener('scroll', onScroll, {
            passive: true,
            capture: true,
        });

        return () => {
            window.removeEventListener('scroll', onScroll, { capture: true });
        };
    }, [threshold]);

    return hidden;
}
