import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: vitePreprocess({
        postcss: true,
    }),

    kit: {
        adapter: adapter({
            pages: '../dist/www',
            assets: '../dist/www',
            fallback: 'index.html',
        }),
    },
};

export default config;
