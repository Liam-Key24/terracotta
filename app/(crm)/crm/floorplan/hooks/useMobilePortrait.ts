import { useEffect, useState } from 'react';

export function useMobilePortrait(): boolean {
    const [isMobilePortrait, setIsMobilePortrait] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const update = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const mobileViewport = Math.min(width, height) <= 767;
            const portrait = height >= width;
            setIsMobilePortrait(mobileViewport && portrait);
        };
        update();
        window.addEventListener('resize', update);
        window.addEventListener('orientationchange', update);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('orientationchange', update);
        };
    }, []);

    return isMobilePortrait;
}
