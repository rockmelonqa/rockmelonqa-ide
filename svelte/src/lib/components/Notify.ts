import { toast, type SvelteToastOptions } from '@zerodevx/svelte-toast';

/**
 * Notify with a toast.
 *
 * See app.css for styling of the container.
 *
 * See __layout.svelte for root level instance of <SvelteToast />
 */
export class Notify {
    public static success = (message: string) =>
        toast.push(message, {
            theme: {
                //'--toastWidth': '32rem',
                '--toastBackground': 'var(--color-success)',
                '--toastColor': 'white',
                '--toastBarBackground': 'var(--color-secondary--extra-light)',
            },
        });

    public static error = (message: string) =>
        toast.push(message, {
            theme: {
                //'--toastWidth': '32rem',
                '--toastBackground': 'var(--color-alert)',
                '--toastColor': 'white',
                '--toastBarBackground': 'var(--color-secondary--extra-light)',
            },
        });

    public static readonly svelteToastOptions: SvelteToastOptions = {
        // Animation to fly in from the top
        intro: { y: -64 },
        pausable: true,
    };
}
