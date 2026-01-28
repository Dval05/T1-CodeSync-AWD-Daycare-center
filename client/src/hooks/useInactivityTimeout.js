import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook para detectar inactividad del usuario
 * @param {number} timeout - Tiempo de inactividad en milisegundos (default: 5 minutos)
 * @param {function} onTimeout - Callback que se ejecuta cuando hay timeout
 */
export const useInactivityTimeout = (timeout = 5 * 60 * 1000, onTimeout) => {
    const timeoutRef = useRef(null);
    const lastActivityRef = useRef(Date.now());

    const resetTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        localStorage.setItem('lastActivity', Date.now().toString());

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            console.log('Sesión expirada por inactividad');
            if (onTimeout) {
                onTimeout();
            }
        }, timeout);
    }, [timeout, onTimeout]);

    useEffect(() => {
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        const lastActivity = localStorage.getItem('lastActivity');
        if (lastActivity) {
            const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
            if (timeSinceLastActivity > timeout) {
                console.log('Sesión previamente expirada detectada');
                if (onTimeout) {
                    onTimeout();
                }
                return;
            }
        }

        resetTimer();

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [resetTimer, timeout, onTimeout]);

    return { resetTimer };
};
